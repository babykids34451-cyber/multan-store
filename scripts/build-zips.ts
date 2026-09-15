import fs from 'fs';
import path from 'path';
import { ZipArchive } from 'archiver';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const downloadsDir = path.join(publicDir, 'downloads');

if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Helper to recursively collect files with custom inclusion/exclusion rules
function collectFiles(dir: string, baseDir: string, filter: (relPath: string) => boolean): string[] {
  let results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (!filter(relPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      results = results.concat(collectFiles(fullPath, baseDir, filter));
    } else if (entry.isFile()) {
      results.push(relPath);
    }
  }

  return results;
}

// Base filter for repository files
function isCleanSourceFile(relPath: string): boolean {
  if (
    relPath.startsWith('node_modules') ||
    relPath.startsWith('.git') ||
    relPath.startsWith('dist') ||
    relPath.startsWith('public/downloads') ||
    relPath.startsWith('scripts') ||
    relPath.endsWith('.zip') ||
    relPath === '.env'
  ) {
    return false;
  }
  return true;
}

// -------------------------------------------------------------
// 1. CREATE WEBSITE ONLY ZIP (Front-End Storefront Portal)
// -------------------------------------------------------------
async function buildWebsiteZip(): Promise<{ filename: string; sizeMb: string }> {
  const filename = 'shaan-storefront-website.zip';
  const outPath = path.join(downloadsDir, filename);
  console.log(`Building ${filename}...`);

  const archive = new ZipArchive({ zlib: { level: 9 } });
  const output = fs.createWriteStream(outPath);
  archive.pipe(output);

  // Files to exclude in website-only edition
  const websiteExcludedFiles = new Set([
    'src/pages/AdminPanelPage.tsx',
  ]);

  const allFiles = collectFiles(rootDir, rootDir, (relPath) => {
    if (!isCleanSourceFile(relPath)) return false;
    if (websiteExcludedFiles.has(relPath)) return false;
    return true;
  });

  for (const relPath of allFiles) {
    const fullPath = path.join(rootDir, relPath);

    if (relPath === 'package.json') {
      // Clean up package.json for website package
      const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      pkg.name = 'shaan-storefront-website';
      pkg.description = 'Shaan Online Store - Customer E-Commerce Storefront Website';
      archive.append(JSON.stringify(pkg, null, 2), { name: 'package.json' });
    } else if (relPath === 'src/App.tsx') {
      // Storefront-dedicated App.tsx without admin routing
      const cleanWebsiteAppTsx = `import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { ToastContainer } from './components/ToastContainer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { WishlistPage } from './pages/WishlistPage';
import { AccountPage } from './pages/AccountPage';
import { InformationPages } from './pages/InformationPages';
import { Product, Order } from './types';

const MainLayout: React.FC = () => {
  const { products, getProductById, getProductBySlug } = useStore();

  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const handleNavigate = (view: string, param?: string) => {
    setViewParam(param);

    if (view === 'product-details' && param) {
      const found = getProductBySlug(param) || getProductById(param);
      if (found) {
        setSelectedProduct(found);
        setCurrentView('product-details');
      } else {
        setCurrentView('shop');
      }
    } else {
      setCurrentView(view);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-details');
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    setCurrentView('order-confirmation');
  };

  return (
    <div className="w-full max-w-full min-h-screen min-h-[100dvh] overflow-x-hidden flex flex-col bg-slate-50 text-slate-900 selection:bg-rose-600 selection:text-white font-sans antialiased">
      <Header currentView={currentView} onNavigate={handleNavigate} />

      <main className="flex-1 w-full max-w-full overflow-x-hidden pb-20 lg:pb-0">
        {currentView === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'shop' && (
          <ShopPage
            initialFilterParam={viewParam}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'product-details' && selectedProduct && (
          <ProductDetailsPage
            product={selectedProduct}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onNavigate={handleNavigate}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentView === 'order-confirmation' && (
          <OrderConfirmationPage
            order={confirmedOrder}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'track' && (
          <TrackOrderPage onNavigate={handleNavigate} />
        )}

        {currentView === 'wishlist' && (
          <WishlistPage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {(currentView === 'account' || currentView === 'orders') && (
          <AccountPage onNavigate={handleNavigate} />
        )}

        {currentView === 'about' && (
          <InformationPages type="about" onNavigate={handleNavigate} />
        )}

        {currentView === 'contact' && (
          <InformationPages type="contact" onNavigate={handleNavigate} />
        )}

        {currentView === 'faq' && (
          <InformationPages type="faq" onNavigate={handleNavigate} />
        )}

        {currentView === 'shipping-policy' && (
          <InformationPages type="shipping" onNavigate={handleNavigate} />
        )}

        {currentView === 'return-policy' && (
          <InformationPages type="returns" onNavigate={handleNavigate} />
        )}

        {currentView === 'privacy-policy' && (
          <InformationPages type="privacy" onNavigate={handleNavigate} />
        )}

        {currentView === 'terms' && (
          <InformationPages type="terms" onNavigate={handleNavigate} />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
      <MobileBottomNav currentView={currentView} onNavigate={handleNavigate} />
      <CartDrawer
        onNavigateToCheckout={() => setCurrentView('checkout')}
        onNavigateToShop={() => setCurrentView('shop')}
      />
      <QuickViewModal />
      <ToastContainer />
      <WhatsAppFloatingButton />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
`;
      archive.append(cleanWebsiteAppTsx, { name: 'src/App.tsx' });
    } else {
      archive.file(fullPath, { name: relPath });
    }
  }

  // Add README.md specifically for the customer storefront
  const websiteReadme = `# Shaan Online Store - Website (Customer Storefront)

This package contains the complete customer-facing eCommerce web application for Shaan Online Store.

## Features Included:
- Premium Pakistani Fashion & Lifestyle Storefront
- Product catalog, category filters, and quick view
- Shopping Cart & Slide-Over Drawer
- Cash on Delivery (COD) Checkout & SBP Raast Bank QR verification
- WhatsApp 1-Click Order Buttons
- Live Order Tracking by Phone / Order ID
- Customer Account & Wishlist
- Responsive Mobile-First App Navigation

## How to Run:
1. Extract this zip file.
2. Run:
   \`\`\`bash
   npm install
   \`\`\`
3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Build for production deployment:
   \`\`\`bash
   npm run build
   \`\`\`
`;
  archive.append(websiteReadme, { name: 'README.md' });

  await archive.finalize();

  return new Promise((resolve) => {
    output.on('close', () => {
      const stats = fs.statSync(outPath);
      const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`[OK] Website ZIP created: ${outPath} (${sizeMb} MB)`);
      resolve({ filename, sizeMb });
    });
  });
}

// -------------------------------------------------------------
// 2. CREATE ADMIN ONLY ZIP (Store Management Portal)
// -------------------------------------------------------------
async function buildAdminZip(): Promise<{ filename: string; sizeMb: string }> {
  const filename = 'shaan-admin-portal.zip';
  const outPath = path.join(downloadsDir, filename);
  console.log(`Building ${filename}...`);

  const archive = new ZipArchive({ zlib: { level: 9 } });
  const output = fs.createWriteStream(outPath);
  archive.pipe(output);

  const allFiles = collectFiles(rootDir, rootDir, (relPath) => {
    if (!isCleanSourceFile(relPath)) return false;
    return true;
  });

  for (const relPath of allFiles) {
    const fullPath = path.join(rootDir, relPath);

    if (relPath === 'package.json') {
      const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      pkg.name = 'shaan-admin-portal';
      pkg.description = 'Shaan Online Store - Dedicated Admin & Inventory Management Portal';
      archive.append(JSON.stringify(pkg, null, 2), { name: 'package.json' });
    } else if (relPath === 'src/App.tsx') {
      // Dedicated Admin App.tsx that immediately opens the Admin Panel
      const dedicatedAdminAppTsx = `import React from 'react';
import { StoreProvider } from './context/StoreContext';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { ToastContainer } from './components/ToastContainer';

const AdminApp: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <AdminPanelPage
        onNavigateToStore={() => {
          alert('This is the standalone Admin Portal. Open the Website package to view the public storefront.');
        }}
      />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AdminApp />
    </StoreProvider>
  );
}
`;
      archive.append(dedicatedAdminAppTsx, { name: 'src/App.tsx' });
    } else {
      archive.file(fullPath, { name: relPath });
    }
  }

  // Add README.md specifically for the admin portal
  const adminReadme = `# Shaan Online Store - Admin & Store Management Portal

This package contains the standalone Admin Management Portal for Shaan Online Store.

## Features Included:
- Master Store Settings (Logo, Brand Name, Short Name, Tagline)
- Product & Inventory Management (Add, Edit, Delete, Stock Levels, Variations)
- Categories & Home Slider Banner Controls
- Order Dispatch & Real-time Order Tracking Status Updates (Pending, Processing, Shipped, Delivered)
- SBP Raast Bank Settings (Raast ID, Account Title, Bank Name, IBAN)
- WhatsApp Order Dispatch and Customer Helpline Numbers
- Discount Coupons Engine & Analytics Overview
- Direct PDF / Thermal Print Invoices for Courier Dispatch

## Default Credentials:
- **Admin Password:** \`admin123\`

## How to Run:
1. Extract this zip file.
2. Run:
   \`\`\`bash
   npm install
   \`\`\`
3. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Build for production deployment:
   \`\`\`bash
   npm run build
   \`\`\`
`;
  archive.append(adminReadme, { name: 'README.md' });

  await archive.finalize();

  return new Promise((resolve) => {
    output.on('close', () => {
      const stats = fs.statSync(outPath);
      const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`[OK] Admin ZIP created: ${outPath} (${sizeMb} MB)`);
      resolve({ filename, sizeMb });
    });
  });
}

// -------------------------------------------------------------
// 3. CREATE COMBINED MASTER REPOSITORY ZIP
// -------------------------------------------------------------
async function buildFullZip(): Promise<{ filename: string; sizeMb: string }> {
  const filename = 'shaan-store-full-project.zip';
  const outPath = path.join(downloadsDir, filename);
  console.log(`Building ${filename}...`);

  const archive = new ZipArchive({ zlib: { level: 9 } });
  const output = fs.createWriteStream(outPath);
  archive.pipe(output);

  const allFiles = collectFiles(rootDir, rootDir, (relPath) => {
    if (!isCleanSourceFile(relPath)) return false;
    return true;
  });

  for (const relPath of allFiles) {
    const fullPath = path.join(rootDir, relPath);
    archive.file(fullPath, { name: relPath });
  }

  await archive.finalize();

  return new Promise((resolve) => {
    output.on('close', () => {
      const stats = fs.statSync(outPath);
      const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`[OK] Full Project ZIP created: ${outPath} (${sizeMb} MB)`);
      resolve({ filename, sizeMb });
    });
  });
}

async function main() {
  try {
    const website = await buildWebsiteZip();
    const admin = await buildAdminZip();
    const full = await buildFullZip();

    console.log('\n--- SUCCESS: ALL PACKAGES READY ---');
    console.log(`1. Website Only ZIP: ${website.filename} (${website.sizeMb} MB)`);
    console.log(`2. Admin Only ZIP: ${admin.filename} (${admin.sizeMb} MB)`);
    console.log(`3. Full Project ZIP: ${full.filename} (${full.sizeMb} MB)`);
  } catch (err) {
    console.error('Packaging failed:', err);
    process.exit(1);
  }
}

main();
