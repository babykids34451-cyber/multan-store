import React, { useState, useEffect } from 'react';
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
import { AdminPanelPage } from './pages/AdminPanelPage';
import { Product, Order } from './types';

// Helper to detect if user opened the secret admin link
const checkIsAdminUrl = (): boolean => {
  if (typeof window === 'undefined') return false;
  const search = window.location.search;
  const hash = window.location.hash;
  const pathname = window.location.pathname;
  return (
    search.includes('admin=true') ||
    search.includes('admin=1') ||
    search.includes('page=admin') ||
    hash === '#admin' ||
    hash.startsWith('#/admin') ||
    pathname.endsWith('/admin')
  );
};

const MainLayout: React.FC = () => {
  const { products, getProductById, getProductBySlug } = useStore();

  const [currentView, setCurrentView] = useState<string>(() => {
    return checkIsAdminUrl() ? 'admin' : 'home';
  });
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Monitor secret admin URL triggers and keyboard shortcuts
  useEffect(() => {
    const handleUrlCheck = () => {
      if (checkIsAdminUrl()) {
        setCurrentView('admin');
      }
    };

    window.addEventListener('popstate', handleUrlCheck);
    window.addEventListener('hashchange', handleUrlCheck);

    // Hidden owner shortcut: Ctrl+Shift+A or Alt+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') ||
        (e.altKey && e.key.toLowerCase() === 'a')
      ) {
        e.preventDefault();
        setCurrentView((prev) => (prev === 'admin' ? 'home' : 'admin'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleUrlCheck);
      window.removeEventListener('hashchange', handleUrlCheck);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedProduct]);

  // Handle Navigation
  const handleNavigate = (view: string, param?: string) => {
    setViewParam(param);
    if (view === 'shop') {
      setCurrentView('shop');
    } else {
      setCurrentView(view);
    }
  };

  // Select Product
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-details');
  };

  // Order Completion
  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    setCurrentView('order-confirmation');
  };

  // If secret admin link is active, render isolated admin portal
  if (currentView === 'admin') {
    return (
      <>
        <AdminPanelPage
          onNavigateToStore={() => {
            if (window.location.search.includes('admin') || window.location.hash.includes('admin')) {
              window.history.pushState({}, '', window.location.pathname);
            }
            setCurrentView('home');
          }}
        />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="w-full max-w-full min-h-screen min-h-[100dvh] overflow-x-hidden flex flex-col bg-slate-50 text-slate-900 selection:bg-rose-600 selection:text-white font-sans antialiased">
      {/* Universal Sticky Header */}
      <Header currentView={currentView} onNavigate={handleNavigate} />

      {/* Main View Router */}
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
            onOrderSuccess={handleOrderSuccess}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'order-confirmation' && confirmedOrder && (
          <OrderConfirmationPage
            order={confirmedOrder}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'track-order' && (
          <TrackOrderPage
            initialOrderId={viewParam}
            onNavigate={handleNavigate}
          />
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

      {/* Universal Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* App-Style Mobile Bottom Navigation Bar */}
      <MobileBottomNav currentView={currentView} onNavigate={handleNavigate} />

      {/* Interactive Cart Slide-Over Drawer */}
      <CartDrawer
        onNavigateToCheckout={() => setCurrentView('checkout')}
        onNavigateToShop={() => setCurrentView('shop')}
      />

      {/* Quick View Modal */}
      <QuickViewModal />

      {/* Micro-Interaction Toasts */}
      <ToastContainer />

      {/* Floating WhatsApp Quick Action Button */}
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
