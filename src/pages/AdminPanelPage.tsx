import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Settings,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Printer,
  Phone,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Shield,
  Lock,
  Unlock,
  LogOut,
  ArrowLeft,
  RefreshCw,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Building2,
  X,
  CreditCard,
  Percent,
  AlertOctagon,
  RotateCcw,
  FolderTree,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Layers,
  Palette,
  Ruler,
  Headphones,
  MessageCircle,
  MapPin,
  Calendar,
  Mail,
  Globe,
  Share2,
  FileText,
  Download,
  Archive,
  FolderDown,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { businessConfig, saveStoredSettings } from '../config/businessConfig';
import {
  getAllOrdersAdmin,
  updateOrderAdmin,
  deleteOrderAdmin,
  clearAllOrdersAdmin,
  restoreDefaultDemoOrders,
} from '../services/orderService';
import { Order, Product, Coupon, OrderStatus, PaymentStatus, Category, Banner } from '../types';
import { ImageUploader } from '../components/ImageUploader';
import { ProductImagesUploader } from '../components/ProductImagesUploader';

interface AdminPanelPageProps {
  onNavigateToStore: () => void;
}

const POPULAR_COLORS = [
  { name: 'Black', hex: '#111827' },
  { name: 'Brown', hex: '#78350f' },
  { name: 'Tan', hex: '#d97706' },
  { name: 'Mustard', hex: '#ca8a04' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Navy Blue', hex: '#1e3a8a' },
  { name: 'Maroon', hex: '#831843' },
  { name: 'Emerald', hex: '#065f46' },
  { name: 'Olive Green', hex: '#3f6212' },
  { name: 'Beige', hex: '#d4b996' },
  { name: 'Grey', hex: '#4b5563' },
  { name: 'Burgundy', hex: '#581c87' },
];

const SIZE_PRESETS = [
  { label: 'Shoes (40 - 45)', value: '40, 41, 42, 43, 44, 45' },
  { label: 'Shoes (38 - 42)', value: '38, 39, 40, 41, 42' },
  { label: 'Clothing (S - XXL)', value: 'S, M, L, XL, XXL' },
  { label: 'Clothing (M - XL)', value: 'M, L, XL' },
  { label: 'Free Size', value: 'Free Size' },
];

function toggleColorInString(currentStr: string, colorName: string): string {
  const current = currentStr
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  const exists = current.some((c) => c.toLowerCase() === colorName.toLowerCase());
  let next: string[];
  if (exists) {
    next = current.filter((c) => c.toLowerCase() !== colorName.toLowerCase());
  } else {
    next = [...current, colorName];
  }
  return next.join(', ');
}

function removeColorFromString(currentStr: string, colorName: string): string {
  const current = currentStr
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  return current.filter((c) => c.toLowerCase() !== colorName.toLowerCase()).join(', ');
}

function removeSizeFromString(currentStr: string, sizeVal: string): string {
  const current = currentStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return current.filter((s) => s.toLowerCase() !== sizeVal.toLowerCase()).join(', ');
}

export const AdminPanelPage: React.FC<AdminPanelPageProps> = ({ onNavigateToStore }) => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    restoreDefaultCategories,
    banners,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerActive,
    restoreDefaultBanners,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    resetAllStoreData,
    restoreDefaultCatalog,
    user,
    signInWithGoogle,
    signOutUser,
    showToast,
  } = useStore();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem('shaan_admin_auth') === 'true' ||
        localStorage.getItem('shaan_admin_auth') === 'true'
      );
    } catch {
      return false;
    }
  });

  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orders' | 'products' | 'categories' | 'banners' | 'coupons' | 'settings' | 'exports'
  >('dashboard');

  // ZIP Downloads & Export State
  const [downloadingZip, setDownloadingZip] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // All Reset State & Modals
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetType, setResetType] = useState<'all' | 'orders'>('all');
  const [resetting, setResetting] = useState(false);

  // Products Filter & Modals
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSizes, setEditingSizes] = useState('');
  const [editingColors, setEditingColors] = useState('');

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditingSizes(product.sizes && product.sizes.length > 0 ? product.sizes.join(', ') : '');
    setEditingColors(product.colors && product.colors.length > 0 ? product.colors.join(', ') : '');
  };

  // Categories Filter & Modals
  const [categorySearch, setCategorySearch] = useState('');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
    itemCount: 15,
  });

  // Banners Filter & Modals
  const [bannerSearch, setBannerSearch] = useState('');
  const [isAddBannerModalOpen, setIsAddBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [newBanner, setNewBanner] = useState<Omit<Banner, 'id'>>({
    tag: '🔥 MEGA FESTIVE SALE 2026',
    headline: "Pakistan's Finest Handcrafted Footwear & Fashion",
    subheadline: 'Authentic Charsadda Peshawari Chappal, Luxury Lawn & Full-Grain Leather with nationwide doorstep Cash on Delivery.',
    badge: 'FLAT 25% OFF',
    offerCode: 'Use code "SHAAN10" for extra 10% off',
    bgImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600&auto=format&fit=crop&q=80',
    primaryBtnText: 'Shop Best Sellers',
    primaryLinkType: 'shop',
    primaryLinkValue: 'featured',
    secondaryBtnText: 'Explore Chappals',
    secondaryLinkType: 'category',
    secondaryLinkValue: 'footwear-chappal',
    accentColor: 'from-rose-600 to-amber-600',
    isActive: true,
    order: 1,
  });

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    slug: '',
    category: categories[0]?.name || "Men's Apparel",
    price: 3500,
    salePrice: 2990,
    stock: 25,
    sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    description: '',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80'] as string[],
    sizes: '40, 41, 42, 43, 44',
    colors: 'Black, Brown, Tan',
    featured: true,
    isNew: true,
  });

  // New Coupon Form State
  const [isAddCouponModalOpen, setIsAddCouponModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Coupon>({
    code: '',
    type: 'percentage',
    value: 10,
    minimumOrder: 3000,
    maximumDiscount: 1000,
    isActive: true,
  });

  // Store, Footer, WhatsApp & Raast Settings State
  const [storeSettings, setStoreSettings] = useState({
    // Store Logo & Branding Identity
    businessName: businessConfig.businessName,
    shortName: businessConfig.shortName || 'Shaan',
    logoUrl: businessConfig.logoUrl || '',
    logoIconText: businessConfig.logoIconText || 'ش',
    tagline: businessConfig.tagline || '',
    aboutText: businessConfig.aboutText || '',

    // Physical Address & Location
    address: businessConfig.address || '',
    city: businessConfig.city || '',
    country: businessConfig.country || 'Pakistan',
    postalCode: businessConfig.postalCode || '54000',

    // Dates, Timings & Working Hours
    workingDays: businessConfig.workingDays || 'Monday - Saturday',
    workingTime: businessConfig.workingTime || '10:00 AM - 9:00 PM PKT',
    businessHours: businessConfig.businessHours || 'Mon - Sat: 10:00 AM - 9:00 PM PKT',
    closedDays: businessConfig.closedDays || 'Sunday (Closed - Online Orders Open 24/7)',

    // WhatsApp Configuration
    orderWhatsapp: businessConfig.orderWhatsapp || businessConfig.whatsapp,
    orderWhatsappDisplay: businessConfig.orderWhatsappDisplay || businessConfig.whatsappDisplay,
    helplineWhatsapp: businessConfig.helplineWhatsapp || businessConfig.whatsapp,
    helplineWhatsappDisplay: businessConfig.helplineWhatsappDisplay || businessConfig.whatsappDisplay,
    whatsapp: businessConfig.whatsapp,
    whatsappDisplay: businessConfig.whatsappDisplay,

    // Direct Contact
    phone: businessConfig.phone || '',
    phoneDisplay: businessConfig.phoneDisplay || '',
    email: businessConfig.email || '',

    // Social Media Links
    facebook: businessConfig.socialLinks.facebook || '',
    instagram: businessConfig.socialLinks.instagram || '',
    tiktok: businessConfig.socialLinks.tiktok || '',
    youtube: businessConfig.socialLinks.youtube || '',

    // Copyright Text
    copyrightText: businessConfig.copyrightText || 'All rights reserved.',

    // Raast Banking
    bankName: businessConfig.paymentSettings.raast.bankName,
    accountTitle: businessConfig.paymentSettings.raast.accountTitle,
    raastId: businessConfig.paymentSettings.raast.raastId,
    iban: businessConfig.paymentSettings.raast.iban,

    // Delivery Settings
    freeDeliveryThreshold: businessConfig.deliverySettings.freeDeliveryThreshold,
    deliveryCharge: businessConfig.deliverySettings.deliveryCharge,
  });

  const [copiedLink, setCopiedLink] = useState(false);

  // Check if current user is owner email
  useEffect(() => {
    if (user && user.email === 'binteayesha466@gmail.com') {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('shaan_admin_auth', 'true');
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  // Load Orders
  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const fetched = await getAllOrdersAdmin();
      setOrders(fetched);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  // Handle Passcode Login
  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim();
    // Authorized credentials
    if (clean === 'admin786' || clean === 'shaan2026' || clean === '03124352369') {
      setIsAuthenticated(true);
      setAuthError('');
      if (rememberMe) {
        localStorage.setItem('shaan_admin_auth', 'true');
      }
      sessionStorage.setItem('shaan_admin_auth', 'true');
      showToast('Admin Portal unlocked successfully!', 'success');
    } else {
      setAuthError('Incorrect Admin Passcode. Try "admin786" or sign in with owner Google account.');
    }
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    localStorage.removeItem('shaan_admin_auth');
    sessionStorage.removeItem('shaan_admin_auth');
    if (user) {
      await signOutUser();
    }
    showToast('Logged out of Admin Portal', 'info');
  };

  // Copy Direct Link to Clipboard
  const handleCopyAdminLink = () => {
    const origin = window.location.origin;
    const adminLink = `${origin}/?admin=true`;
    navigator.clipboard.writeText(adminLink);
    setCopiedLink(true);
    showToast('Admin link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updated = await updateOrderAdmin(orderId, { orderStatus: status });
      setOrders((prev) => prev.map((o) => (o.orderId === orderId ? updated : o)));
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(updated);
      }
      showToast(`Order ${orderId} marked as ${status.toUpperCase()}`, 'success');
    } catch (err) {
      showToast('Failed to update order status', 'error');
    }
  };

  // Payment Status Update
  const handleUpdatePaymentStatus = async (orderId: string, status: PaymentStatus) => {
    try {
      const updated = await updateOrderAdmin(orderId, { paymentStatus: status });
      setOrders((prev) => prev.map((o) => (o.orderId === orderId ? updated : o)));
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(updated);
      }
      showToast(`Payment marked as ${status.toUpperCase()}`, 'success');
    } catch (err) {
      showToast('Failed to update payment status', 'error');
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to delete order ${orderId}?`)) return;
    try {
      await deleteOrderAdmin(orderId);
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder(null);
      }
      showToast(`Order ${orderId} deleted`, 'info');
    } catch (err) {
      showToast('Failed to delete order', 'error');
    }
  };

  // WhatsApp Customer Link
  const getWhatsAppOrderLink = (order: Order) => {
    const phoneClean = order.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = phoneClean.startsWith('0') ? `92${phoneClean.slice(1)}` : phoneClean;
    const message = `Assalam-o-Alaikum ${order.customerName}! 🌸\nThis is ${businessConfig.businessName} regarding your order #${order.orderId}.\n\nTotal Amount: Rs. ${order.total.toLocaleString()}\nPayment Method: ${order.paymentMethod.toUpperCase()}\nCurrent Status: ${order.orderStatus.toUpperCase()}\n\nPlease reply to confirm your delivery address: ${order.deliveryAddress}, ${order.city}. Thank you!`;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
  };

  // Create Product Submit
  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      showToast('Please provide product name and price', 'error');
      return;
    }

    const sizesArr = newProduct.sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const colorsArr = newProduct.colors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const validImages = (newProduct.images || []).filter((img) => Boolean(img && img.trim()));
    const finalImages = validImages.length > 0
      ? validImages
      : (newProduct.image ? [newProduct.image] : ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80']);

    const created = addProduct({
      name: newProduct.name,
      slug: newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: newProduct.category,
      price: Number(newProduct.price),
      salePrice: newProduct.salePrice ? Number(newProduct.salePrice) : undefined,
      stock: Number(newProduct.stock) || 10,
      sku: newProduct.sku,
      description: newProduct.description || `${newProduct.name} crafted with authentic Pakistani materials.`,
      images: finalImages,
      sizes: sizesArr.length > 0 ? sizesArr : undefined,
      colors: colorsArr.length > 0 ? colorsArr : undefined,
      featured: newProduct.featured,
      isNew: newProduct.isNew,
      isActive: true,
      rating: 5,
      reviewCount: 1,
    });

    showToast(`Product "${created.name}" added with ${finalImages.length} images!`, 'success');
    setIsAddProductModalOpen(false);
    // Reset form
    setNewProduct({
      name: '',
      slug: '',
      category: categories[0]?.name || "Men's Apparel",
      price: 3500,
      salePrice: 2990,
      stock: 25,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      description: '',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
      images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80'],
      sizes: '40, 41, 42, 43, 44',
      colors: 'Black, Brown, Tan',
      featured: true,
      isNew: true,
    });
  };

  // Edit Product Submit
  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const sizesArr = editingSizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const colorsArr = editingColors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    updateProduct(editingProduct.id, {
      name: editingProduct.name,
      price: Number(editingProduct.price),
      salePrice: editingProduct.salePrice ? Number(editingProduct.salePrice) : undefined,
      stock: Number(editingProduct.stock),
      sku: editingProduct.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      description: editingProduct.description || `${editingProduct.name} crafted with authentic Pakistani materials.`,
      category: editingProduct.category,
      images: editingProduct.images && editingProduct.images.length > 0
        ? editingProduct.images
        : ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80'],
      sizes: sizesArr.length > 0 ? sizesArr : undefined,
      colors: colorsArr.length > 0 ? colorsArr : undefined,
      featured: editingProduct.featured,
      isNew: editingProduct.isNew,
      isActive: editingProduct.isActive,
    });

    showToast(`Product "${editingProduct.name}" updated!`, 'success');
    setEditingProduct(null);
    setEditingSizes('');
    setEditingColors('');
  };

  // Create Coupon Submit
  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.value) {
      showToast('Please enter coupon code and value', 'error');
      return;
    }

    addCoupon({
      ...newCoupon,
      code: newCoupon.code.trim().toUpperCase(),
    });

    showToast(`Coupon "${newCoupon.code.toUpperCase()}" created!`, 'success');
    setIsAddCouponModalOpen(false);
    setNewCoupon({
      code: '',
      type: 'percentage',
      value: 10,
      minimumOrder: 3000,
      maximumDiscount: 1000,
      isActive: true,
    });
  };

  // Category Actions
  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }
    const slug = (newCategory.slug || newCategory.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const created = addCategory({
      name: newCategory.name.trim(),
      slug,
      description: newCategory.description.trim(),
      image: newCategory.image.trim() || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
      itemCount: Number(newCategory.itemCount) || 10,
    });
    showToast(`Category "${created.name}" created successfully!`, 'success');
    setIsAddCategoryModalOpen(false);
    setNewCategory({
      name: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
      itemCount: 15,
    });
  };

  const handleEditCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;
    updateCategory(editingCategory.id, {
      name: editingCategory.name.trim(),
      slug: editingCategory.slug.trim(),
      description: editingCategory.description?.trim(),
      image: editingCategory.image,
      itemCount: Number(editingCategory.itemCount) || 10,
    });
    showToast(`Category "${editingCategory.name}" updated!`, 'success');
    setEditingCategory(null);
  };

  // Banner Actions
  const handleCreateBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.headline.trim()) {
      showToast('Banner headline is required', 'error');
      return;
    }
    const created = addBanner(newBanner);
    showToast(`Banner "${created.headline.slice(0, 25)}..." added!`, 'success');
    setIsAddBannerModalOpen(false);
  };

  const handleEditBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner || !editingBanner.headline.trim()) return;
    updateBanner(editingBanner.id, editingBanner);
    showToast('Banner updated successfully!', 'success');
    setEditingBanner(null);
  };

  // Logo file upload handler
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      showToast('Barah-e-karam tasweer (PNG, JPG, SVG ya WebP) select karein', 'error');
      return;
    }

    // Check size (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Logo image ka size 2MB se kam hona chahiye', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setStoreSettings((prev) => ({
          ...prev,
          logoUrl: result,
        }));
        showToast('Logo tasweer select ho gayi! Ab "Save Store Settings" par click karein.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Store Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    // Store Logo & Branding
    businessConfig.businessName = storeSettings.businessName.trim() || 'Shaan Online Store';
    businessConfig.shortName = storeSettings.shortName.trim() || storeSettings.businessName.trim() || 'Shaan';
    businessConfig.logoUrl = storeSettings.logoUrl.trim();
    businessConfig.logoIconText = storeSettings.logoIconText.trim() || 'ش';
    businessConfig.tagline = storeSettings.tagline.trim();
    businessConfig.aboutText = storeSettings.aboutText.trim();

    // Physical Address & Location
    businessConfig.address = storeSettings.address.trim();
    businessConfig.city = storeSettings.city.trim();
    businessConfig.country = storeSettings.country.trim() || 'Pakistan';
    businessConfig.postalCode = storeSettings.postalCode.trim();

    // Operating Dates, Days & Working Hours
    businessConfig.workingDays = storeSettings.workingDays.trim();
    businessConfig.workingTime = storeSettings.workingTime.trim();
    businessConfig.businessHours = storeSettings.workingDays.trim() && storeSettings.workingTime.trim()
      ? `${storeSettings.workingDays.trim()}: ${storeSettings.workingTime.trim()}`
      : storeSettings.businessHours.trim();
    businessConfig.closedDays = storeSettings.closedDays.trim();

    // Copyright
    businessConfig.copyrightText = storeSettings.copyrightText.trim();

    // Direct Contact
    businessConfig.phone = storeSettings.phone.trim();
    businessConfig.phoneDisplay = storeSettings.phoneDisplay.trim();
    businessConfig.email = storeSettings.email.trim();

    // Social Links
    businessConfig.socialLinks.facebook = storeSettings.facebook.trim();
    businessConfig.socialLinks.instagram = storeSettings.instagram.trim();
    businessConfig.socialLinks.tiktok = storeSettings.tiktok.trim();
    businessConfig.socialLinks.youtube = storeSettings.youtube.trim();

    // SBP Raast Settings
    businessConfig.paymentSettings.raast.bankName = storeSettings.bankName;
    businessConfig.paymentSettings.raast.accountTitle = storeSettings.accountTitle;
    businessConfig.paymentSettings.raast.raastId = storeSettings.raastId;
    businessConfig.paymentSettings.raast.iban = storeSettings.iban;

    // Order WhatsApp
    businessConfig.orderWhatsapp = storeSettings.orderWhatsapp.trim();
    businessConfig.orderWhatsappDisplay = storeSettings.orderWhatsappDisplay.trim();

    // Helpline WhatsApp
    businessConfig.helplineWhatsapp = storeSettings.helplineWhatsapp.trim();
    businessConfig.helplineWhatsappDisplay = storeSettings.helplineWhatsappDisplay.trim();

    // Legacy fallback compatibility
    businessConfig.whatsapp = storeSettings.helplineWhatsapp.trim() || storeSettings.orderWhatsapp.trim();
    businessConfig.whatsappDisplay = storeSettings.helplineWhatsappDisplay.trim() || storeSettings.orderWhatsappDisplay.trim();

    businessConfig.deliverySettings.freeDeliveryThreshold = Number(storeSettings.freeDeliveryThreshold);
    businessConfig.deliverySettings.deliveryCharge = Number(storeSettings.deliveryCharge);

    // Save to persistent localStorage
    saveStoredSettings({
      businessName: businessConfig.businessName,
      shortName: businessConfig.shortName,
      logoUrl: businessConfig.logoUrl,
      logoIconText: businessConfig.logoIconText,
      tagline: businessConfig.tagline,
      aboutText: businessConfig.aboutText,
      address: businessConfig.address,
      city: businessConfig.city,
      country: businessConfig.country,
      postalCode: businessConfig.postalCode,
      workingDays: businessConfig.workingDays,
      workingTime: businessConfig.workingTime,
      businessHours: businessConfig.businessHours,
      closedDays: businessConfig.closedDays,
      copyrightText: businessConfig.copyrightText,
      phone: businessConfig.phone,
      phoneDisplay: businessConfig.phoneDisplay,
      email: businessConfig.email,
      facebook: businessConfig.socialLinks.facebook,
      instagram: businessConfig.socialLinks.instagram,
      tiktok: businessConfig.socialLinks.tiktok,
      youtube: businessConfig.socialLinks.youtube,
      bankName: storeSettings.bankName,
      accountTitle: storeSettings.accountTitle,
      raastId: storeSettings.raastId,
      iban: storeSettings.iban,
      orderWhatsapp: storeSettings.orderWhatsapp.trim(),
      orderWhatsappDisplay: storeSettings.orderWhatsappDisplay.trim(),
      helplineWhatsapp: storeSettings.helplineWhatsapp.trim(),
      helplineWhatsappDisplay: storeSettings.helplineWhatsappDisplay.trim(),
      freeDeliveryThreshold: Number(storeSettings.freeDeliveryThreshold),
      deliveryCharge: Number(storeSettings.deliveryCharge),
    });

    showToast('Footer Address, Timings, WhatsApp aur tamam Store Settings kamyabi se save ho gayeen!', 'success');
  };

  // Master All Reset Handler
  const handleExecuteReset = async () => {
    setResetting(true);
    try {
      if (resetType === 'all') {
        await resetAllStoreData();
        setOrders([]);
        showToast('Sab kuch kamyabi se delete aur reset ho gaya!', 'success');
      } else {
        await clearAllOrdersAdmin();
        setOrders([]);
        showToast('Tamam customer orders kamyabi se delete ho gaye!', 'success');
      }
      setIsResetModalOpen(false);
    } catch (error) {
      console.error('Reset error:', error);
      showToast('Reset ke doran masla pesh aaya, dubara koshish karein.', 'error');
    } finally {
      setResetting(false);
    }
  };

  // Restore Default Sample Catalog & Orders
  const handleRestoreDefaults = async () => {
    restoreDefaultCatalog();
    restoreDefaultDemoOrders();
    const freshOrders = await getAllOrdersAdmin();
    setOrders(freshOrders);
    showToast('Default catalog aur demo data kamyabi se restore ho gaya!', 'success');
  };

  // Analytics Metrics
  const metrics = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;
    const confirmedOrders = orders.filter((o) => o.orderStatus === 'confirmed').length;
    const shippedOrders = orders.filter((o) => o.orderStatus === 'shipped').length;
    const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered').length;

    const codCount = orders.filter((o) => o.paymentMethod === 'cod').length;
    const raastCount = orders.filter((o) => o.paymentMethod === 'raast').length;

    const lowStockCount = products.filter((p) => p.stock < 5).length;

    return {
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      codCount,
      raastCount,
      totalProducts: products.length,
      lowStockCount,
    };
  }, [orders, products]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.customerPhone.includes(orderSearch) ||
        order.city.toLowerCase().includes(orderSearch.toLowerCase());

      const matchStatus = orderStatusFilter === 'all' || order.orderStatus === orderStatusFilter;
      const matchPayment = orderPaymentFilter === 'all' || order.paymentMethod === orderPaymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [orders, orderSearch, orderStatusFilter, orderPaymentFilter]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase());
      const matchCat =
        productCategoryFilter === 'all' ||
        p.category.toLowerCase() === productCategoryFilter.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [products, productSearch, productCategoryFilter]);

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const q = categorySearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    });
  }, [categories, categorySearch]);

  // Filtered Banners
  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      const q = bannerSearch.toLowerCase();
      return (
        b.headline.toLowerCase().includes(q) ||
        (b.subheadline && b.subheadline.toLowerCase().includes(q)) ||
        (b.tag && b.tag.toLowerCase().includes(q)) ||
        (b.offerCode && b.offerCode.toLowerCase().includes(q))
      );
    });
  }, [banners, bannerSearch]);

  // ==========================================
  // 1. RENDER: LOGIN GATE IF NOT AUTHENTICATED
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-2">
            {businessConfig.logoUrl ? (
              <div className="w-14 h-14 bg-white rounded-2xl p-1.5 flex items-center justify-center mx-auto shadow-lg border border-slate-700">
                <img
                  src={businessConfig.logoUrl}
                  alt={businessConfig.businessName}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-14 h-14 bg-gradient-to-tr from-rose-600 to-rose-400 text-white rounded-2xl flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-rose-600/30">
                {businessConfig.logoIconText || 'ش'}
              </div>
            )}
            <h1 className="text-2xl font-black tracking-tight text-white">
              {businessConfig.businessName}
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-400">
              Admin & Store Management Portal
            </p>
            <p className="text-xs text-slate-400 pt-1">
              Private access restricted to authorized personnel only.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          {/* Passcode Login Form */}
          <form onSubmit={handlePasscodeLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Master Admin Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode (e.g. admin786)"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Hint for owner: <span className="font-mono text-amber-300">admin786</span>
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 bg-slate-950"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              id="admin-login-btn"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Portal</span>
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider">
              Or
            </span>
          </div>

          {/* Google Sign-in with Owner Account */}
          <button
            onClick={async () => {
              const ok = await signInWithGoogle();
              if (ok) {
                setIsAuthenticated(true);
                sessionStorage.setItem('shaan_admin_auth', 'true');
              }
            }}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Sign In with Google ({user?.email || 'binteayesha466@gmail.com'})</span>
          </button>

          {/* Return to Public Store */}
          <div className="pt-2 text-center">
            <button
              onClick={onNavigateToStore}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. RENDER: FULL ADMIN DASHBOARD WORKSPACE
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-rose-600 selection:text-white">
      {/* Top Secret Admin Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            {businessConfig.logoUrl ? (
              <div className="w-9 h-9 bg-white rounded-xl p-1 flex items-center justify-center border border-slate-700 shadow-xs shrink-0">
                <img
                  src={businessConfig.logoUrl}
                  alt={businessConfig.businessName}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-9 h-9 bg-gradient-to-tr from-rose-600 to-rose-400 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md shadow-rose-600/30 shrink-0">
                {businessConfig.logoIconText || 'ش'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-white">
                  {businessConfig.businessName}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-[10px] font-black uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Master Storefront Control & Order Dispatch System
              </p>
            </div>
          </div>

          {/* Direct Link Share & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Copy Secret Admin Link Button */}
            <button
              onClick={handleCopyAdminLink}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Copy direct admin URL to open anytime"
              id="copy-admin-link-btn"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Copy Secret Link</span>
                  <span className="md:hidden">Link</span>
                </>
              )}
            </button>

            {/* Download ZIP Packages Button */}
            <button
              onClick={() => setActiveTab('exports')}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-800/80 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Download separate Website & Admin ZIP packages"
              id="admin-top-download-zip-btn"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Download ZIP</span>
              <span className="md:hidden">ZIP</span>
            </button>

            {/* All Reset Button */}
            <button
              onClick={() => {
                setResetType('all');
                setIsResetModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-white border border-red-800/80 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="All Reset: Sab kuch delete karein ya reset karein"
              id="admin-top-all-reset-btn"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">All Reset</span>
              <span className="sm:hidden">Reset</span>
            </button>

            {/* View Live Store */}
            <button
              onClick={onNavigateToStore}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-rose-600/20"
              id="visit-storefront-btn"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Public Store</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
              title="Log out of Admin Portal"
              id="admin-logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders Management</span>
            {metrics.pendingOrders > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-black animate-pulse">
                {metrics.pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products & Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'banners'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Promotional Banners ({banners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Discount Coupons ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-rose-500 text-rose-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Raast Bank & Store Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('exports')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'exports'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30'
                : 'border-transparent text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Download ZIP Files (الگ الگ فائلز)</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ===================================== */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ===================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Direct Admin Link Notice Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800/90 to-slate-900 border border-slate-700 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Your Dedicated Secret Admin URL</span>
                </div>
                <p className="text-xs text-slate-300">
                  Bookmark this secret link or save it on WhatsApp. No visitor on the main website can see this admin link:
                </p>
                <div className="font-mono text-xs text-rose-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 select-all inline-block break-all mt-1">
                  {typeof window !== 'undefined' ? `${window.location.origin}/?admin=true` : '/?admin=true'}
                </div>
              </div>
              <button
                onClick={handleCopyAdminLink}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-md"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
              </button>
            </div>

            {/* Metrics KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <span>Gross Sales</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  Rs. {metrics.totalRevenue.toLocaleString()}
                </div>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Delivered & confirmed Pakistani orders</span>
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <span>Total Orders</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {metrics.totalOrders}
                </div>
                <p className="text-[11px] text-slate-400">
                  {metrics.pendingOrders} pending verification • {metrics.shippedOrders} in transit
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <span>Payment Channels</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl font-black text-white flex items-center gap-3">
                  <span className="text-emerald-400">{metrics.codCount} COD</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-amber-400">{metrics.raastCount} Raast</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Doorstep cash & SBP Raast 0% fee
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <span>Catalog & Stock</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {metrics.totalProducts} Products
                </div>
                <p className="text-[11px] text-rose-400">
                  {metrics.lowStockCount > 0 ? `⚠️ ${metrics.lowStockCount} items low in stock` : 'All items well-stocked'}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons & Recent Orders Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols: Recent Orders */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Recent Customer Orders</h3>
                    <p className="text-xs text-slate-400">Latest orders placed across Pakistan</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="divide-y divide-slate-800 overflow-x-auto">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.orderId} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">{order.orderId}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              order.orderStatus === 'delivered'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                : order.orderStatus === 'shipped'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                                : order.orderStatus === 'confirmed'
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                                : order.orderStatus === 'cancelled'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                                : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-semibold">
                          {order.customerName} • <span className="text-slate-400">{order.city}</span>
                        </p>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-sm font-black text-white">
                          Rs. {order.total.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400 uppercase font-bold">
                          {order.paymentMethod} • {order.paymentStatus}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Col: Quick Admin Actions */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-base font-extrabold text-white">Quick Store Actions</h3>
                <p className="text-xs text-slate-400">Manage catalog and store setup</p>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setIsAddProductModalOpen(true);
                    }}
                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold rounded-xl border border-slate-700 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      Add New Product
                    </span>
                    <span className="text-slate-400">→</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('coupons');
                      setIsAddCouponModalOpen(true);
                    }}
                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold rounded-xl border border-slate-700 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-400" />
                      Create Discount Coupon
                    </span>
                    <span className="text-slate-400">→</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold rounded-xl border border-slate-700 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-rose-400" />
                      Edit Raast Bank Details
                    </span>
                    <span className="text-slate-400">→</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('exports')}
                    className="w-full py-3 px-4 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-200 hover:text-white text-xs font-extrabold rounded-xl border border-emerald-800/60 flex items-center justify-between transition-all cursor-pointer shadow-xs"
                    id="dashboard-download-zips-btn"
                  >
                    <span className="flex items-center gap-2">
                      <Archive className="w-4 h-4 text-emerald-400" />
                      Download ZIP Packages (الگ الگ فائلز)
                    </span>
                    <span className="text-emerald-400">↓</span>
                  </button>

                  <button
                    onClick={loadOrders}
                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold rounded-xl border border-slate-700 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-blue-400" />
                      Sync Orders From Cloud
                    </span>
                    <span className="text-slate-400">↻</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================== */}
        {/* TAB 2: ORDERS MANAGEMENT */}
        {/* ===================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Orders Management & Tracking
                </h2>
                <p className="text-xs text-slate-400">
                  Update customer statuses, verify Raast payments, and dispatch Cash on Delivery parcels
                </p>
              </div>

              <button
                onClick={loadOrders}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all cursor-pointer w-fit"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Refresh Orders</span>
              </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative w-full md:flex-1">
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer Name, Phone, or City..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full md:w-auto px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="all">All Order Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped (In Transit)</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={orderPaymentFilter}
                  onChange={(e) => setOrderPaymentFilter(e.target.value)}
                  className="w-full md:w-auto px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="all">All Payment Methods</option>
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="raast">SBP Raast</option>
                  <option value="jazzcash">JazzCash</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              {ordersLoading ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  <RefreshCw className="w-6 h-6 text-rose-500 animate-spin mx-auto mb-2" />
                  Loading customer orders...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  No orders match the current search or filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4 font-extrabold">Order ID & Date</th>
                        <th className="py-3.5 px-4 font-extrabold">Customer</th>
                        <th className="py-3.5 px-4 font-extrabold">City & Address</th>
                        <th className="py-3.5 px-4 font-extrabold">Amount</th>
                        <th className="py-3.5 px-4 font-extrabold">Payment</th>
                        <th className="py-3.5 px-4 font-extrabold">Status</th>
                        <th className="py-3.5 px-4 font-extrabold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-medium">
                      {filteredOrders.map((order) => (
                        <tr key={order.orderId} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-white text-xs">{order.orderId}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('en-PK', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{order.customerName}</div>
                            <div className="text-[11px] text-slate-400">{order.customerPhone}</div>
                          </td>

                          <td className="py-3.5 px-4 max-w-[200px]">
                            <span className="font-bold text-slate-200">{order.city}</span>
                            <p className="text-[11px] text-slate-400 truncate" title={order.deliveryAddress}>
                              {order.deliveryAddress}
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-black text-white text-sm">
                              Rs. {order.total.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {order.items.reduce((c, i) => c + i.quantity, 0)} item(s)
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-black text-[10px] uppercase">
                              {order.paymentMethod}
                            </span>
                            <div className="mt-1">
                              <span
                                className={`text-[10px] font-bold ${
                                  order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-slate-400'
                                }`}
                              >
                                {order.paymentStatus.toUpperCase()}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <select
                              value={order.orderStatus}
                              onChange={(e) =>
                                handleUpdateOrderStatus(order.orderId, e.target.value as OrderStatus)
                              }
                              className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold focus:outline-none cursor-pointer border ${
                                order.orderStatus === 'delivered'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                  : order.orderStatus === 'shipped'
                                  ? 'bg-blue-950 text-blue-300 border-blue-800'
                                  : order.orderStatus === 'confirmed'
                                  ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                                  : order.orderStatus === 'cancelled'
                                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                                  : 'bg-amber-950 text-amber-300 border-amber-800'
                              }`}
                            >
                              <option value="pending" className="bg-slate-900 text-white">Pending</option>
                              <option value="confirmed" className="bg-slate-900 text-white">Confirmed</option>
                              <option value="shipped" className="bg-slate-900 text-white">Shipped</option>
                              <option value="delivered" className="bg-slate-900 text-white">Delivered</option>
                              <option value="cancelled" className="bg-slate-900 text-white">Cancelled</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* WhatsApp Direct Chat */}
                              <a
                                href={getWhatsAppOrderLink(order)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 transition-colors"
                                title="Chat on WhatsApp regarding this order"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>

                              {/* View Details Modal */}
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
                                title="View full details and packing slip"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Order */}
                              <button
                                onClick={() => handleDeleteOrder(order.orderId)}
                                className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-900/50 transition-colors cursor-pointer"
                                title="Delete order"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================== */}
        {/* TAB 3: PRODUCTS & INVENTORY */}
        {/* ===================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Catalog & Inventory Control
                </h2>
                <p className="text-xs text-slate-400">
                  Manage product pricing, stock quantities, and catalog listings
                </p>
              </div>

              <button
                onClick={() => setIsAddProductModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-600/30 w-fit"
                id="add-product-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Product Search & Filter Bar */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:flex-1">
                <input
                  type="text"
                  placeholder="Search products by title or SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Products Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 font-extrabold">Product</th>
                      <th className="py-3.5 px-4 font-extrabold">Category</th>
                      <th className="py-3.5 px-4 font-extrabold">Price (PKR)</th>
                      <th className="py-3.5 px-4 font-extrabold">Stock</th>
                      <th className="py-3.5 px-4 font-extrabold">Badges</th>
                      <th className="py-3.5 px-4 font-extrabold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={product.images[0] || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200'}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded-lg border border-slate-700"
                              />
                              {product.images.length > 1 && (
                                <span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-rose-600 text-white text-[9px] font-black rounded-full border border-slate-900 shadow-xs">
                                  {product.images.length}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white">{product.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 flex-wrap">
                                <span>SKU: {product.sku}</span>
                                {product.images.length > 1 && (
                                  <span className="text-rose-400 font-semibold">• {product.images.length} photos</span>
                                )}
                                {product.colors && product.colors.length > 0 && (
                                  <span className="text-amber-400 font-semibold">• {product.colors.length} colors</span>
                                )}
                                {product.sizes && product.sizes.length > 0 && (
                                  <span className="text-pink-400 font-semibold">• {product.sizes.length} sizes</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300">{product.category}</td>

                        <td className="py-3.5 px-4">
                          <div className="font-black text-white">
                            Rs. {product.salePrice ? product.salePrice.toLocaleString() : product.price.toLocaleString()}
                          </div>
                          {product.salePrice && (
                            <div className="text-[10px] text-slate-500 line-through">
                              Rs. {product.price.toLocaleString()}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              product.stock <= 3
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : product.stock <= 10
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {product.stock} units
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1">
                            {product.featured && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-bold">
                                Featured
                              </span>
                            )}
                            {product.isNew && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 text-[10px] font-bold">
                                New
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditProduct(product)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
                              title="Edit product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Delete product "${product.name}"?`)) {
                                  deleteProduct(product.id);
                                  showToast(`Product deleted`, 'info');
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-900/50 transition-colors cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================== */}
        {/* TAB: CATEGORIES MANAGEMENT */}
        {/* ===================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-rose-500" />
                  Storefront Categories ({categories.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Organize store inventory, circular category pills on home page, and navigation filters
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Restore default handcrafted Pakistani categories? This will reset custom categories.')) {
                      restoreDefaultCategories();
                      showToast('Default categories restored successfully!', 'info');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-600/30"
                  id="add-category-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Category</span>
                </button>
              </div>
            </div>

            {/* Search filter bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-lg">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search categories by name, slug or description..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Showing <strong className="text-white">{filteredCategories.length}</strong> of {categories.length} categories</span>
              </div>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCategories.map((category) => {
                const linkedProductsCount = products.filter(
                  (p) =>
                    p.category.toLowerCase() === category.name.toLowerCase() ||
                    p.category.toLowerCase() === category.slug.toLowerCase()
                ).length;

                return (
                  <div
                    key={category.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all group"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative h-36 bg-slate-950 overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                        <div className="absolute top-2.5 right-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-950/80 text-rose-300 border border-slate-700 backdrop-blur-xs">
                            /{category.slug}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <h3 className="text-base font-extrabold text-white leading-tight">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {category.description}
                          </p>
                        )}

                        <div className="pt-2 flex items-center justify-between text-xs">
                          <span className="text-slate-400">Inventory:</span>
                          <span className="font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-800/40">
                            {linkedProductsCount} Live Products
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setProductCategoryFilter(category.name);
                          setActiveTab('products');
                        }}
                        className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                        title="Filter products by this category"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Filter Items</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingCategory(category)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete category "${category.name}"? Existing products won't be deleted but will uncouple.`)) {
                              deleteCategory(category.id);
                              showToast(`Category "${category.name}" deleted`, 'info');
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredCategories.length === 0 && (
              <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                <FolderTree className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No categories found</h3>
                <p className="text-xs text-slate-400">Try refining your search query or create a new category.</p>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Category</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===================================== */}
        {/* TAB: PROMOTIONAL BANNERS MANAGEMENT */}
        {/* ===================================== */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-rose-500" />
                  Hero Slider & Promotional Banners ({banners.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Customise top hero carousel banners, sale headlines, coupon callouts, and direct destination buttons
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset hero banners to default festive campaigns?')) {
                      restoreDefaultBanners();
                      showToast('Default promotional banners restored!', 'info');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddBannerModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-600/30"
                  id="add-banner-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Banner</span>
                </button>
              </div>
            </div>

            {/* Banner Search Filter */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-lg">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search banners by headline, offer code, tag..."
                  value={bannerSearch}
                  onChange={(e) => setBannerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  {banners.filter((b) => b.isActive).length} Active on Storefront
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                  {banners.filter((b) => !b.isActive).length} Paused
                </span>
              </div>
            </div>

            {/* Banners Cards List */}
            <div className="space-y-6">
              {filteredBanners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`bg-slate-900 border rounded-3xl overflow-hidden shadow-xl transition-all ${
                    banner.isActive ? 'border-slate-800' : 'border-slate-800/40 opacity-75'
                  }`}
                >
                  {/* Top Bar with Status and Actions */}
                  <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        Slide #{index + 1}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          banner.isActive
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {banner.isActive ? '● Live on Store' : '○ Disabled'}
                      </span>
                      {banner.tag && (
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-300 text-[10px] font-bold border border-rose-900/50">
                          {banner.tag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          toggleBannerActive(banner.id);
                          showToast(
                            `Banner slide ${banner.isActive ? 'paused' : 'activated for storefront'}`,
                            'info'
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          banner.isActive
                            ? 'bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60'
                            : 'bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60'
                        }`}
                      >
                        {banner.isActive ? 'Pause Slide' : 'Activate Slide'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingBanner(banner)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this promotional banner?')) {
                            deleteBanner(banner.id);
                            showToast('Banner slide deleted', 'info');
                          }
                        }}
                        className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs transition-colors cursor-pointer"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Live Visual Preview of Banner as it appears on home page */}
                  <div className="relative min-h-[220px] sm:min-h-[260px] bg-slate-950 flex items-center overflow-hidden">
                    <img
                      src={banner.bgImage}
                      alt={banner.headline}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30" />

                    <div className="relative z-10 p-5 sm:p-8 max-w-2xl space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {banner.tag && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-600 text-white shadow-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {banner.tag}
                          </span>
                        )}
                        {banner.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-slate-200 border border-white/20">
                            {banner.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-2xl font-black text-white leading-tight drop-shadow-sm">
                        {banner.headline}
                      </h3>

                      {banner.subheadline && (
                        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                          {banner.subheadline}
                        </p>
                      )}

                      {banner.offerCode && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-[11px] font-bold text-amber-300">
                          <Tag className="w-3 h-3 text-amber-400" />
                          <span>{banner.offerCode}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        {banner.primaryBtnText && (
                          <div className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-md">
                            <span>{banner.primaryBtnText}</span>
                            <span className="text-[10px] opacity-75">({banner.primaryLinkType})</span>
                          </div>
                        )}
                        {banner.secondaryBtnText && (
                          <div className="px-3.5 py-2 bg-white/10 border border-white/20 text-white text-xs font-medium rounded-xl">
                            <span>{banner.secondaryBtnText}</span>
                            <span className="text-[10px] opacity-75 ml-1">({banner.secondaryLinkType})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredBanners.length === 0 && (
              <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No promotional banners found</h3>
                <p className="text-xs text-slate-400">Create your first hero slider banner for seasonal promotions.</p>
                <button
                  type="button"
                  onClick={() => setIsAddBannerModalOpen(true)}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Banner</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===================================== */}
        {/* TAB 4: COUPONS MANAGEMENT */}
        {/* ===================================== */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Discount Coupons & Promotional Codes
                </h2>
                <p className="text-xs text-slate-400">
                  Create percentage or fixed PKR discount vouchers for campaigns
                </p>
              </div>

              <button
                onClick={() => setIsAddCouponModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg w-fit"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-black text-amber-300 tracking-wider bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                      {coupon.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        coupon.isActive
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="text-lg font-black text-white">
                      {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `Rs. ${coupon.value} OFF`}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Min Order: Rs. {coupon.minimumOrder.toLocaleString()}
                    </p>
                    {coupon.maximumDiscount && (
                      <p className="text-[11px] text-slate-400">
                        Max Cap: Rs. {coupon.maximumDiscount.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <button
                      onClick={() => {
                        updateCoupon(coupon.code, { isActive: !coupon.isActive });
                        showToast(
                          `Coupon ${coupon.code} ${coupon.isActive ? 'deactivated' : 'activated'}`,
                          'info'
                        );
                      }}
                      className="text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                    >
                      {coupon.isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete coupon "${coupon.code}"?`)) {
                          deleteCoupon(coupon.code);
                          showToast(`Coupon ${coupon.code} deleted`, 'info');
                        }
                      }}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================== */}
        {/* TAB 5: STORE & RAAST SETTINGS */}
        {/* ===================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Store, WhatsApp & SBP Raast Settings
              </h2>
              <p className="text-xs text-slate-400">
                Order on WhatsApp aur Helpline WhatsApp ke alag alag numbers set karein, Raast credentials aur delivery configure karein.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* SECTION 1: Website Logo & Brand Identity */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-400 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        1. Website Logo & Brand Name (ویب سائٹ کا لوگو اور برانڈ نام)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Store ka mukammal naam, header short name, aur logo tasweer ya monogram tabdeel karein
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60">
                    Logo & Name
                  </span>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Website Full Name (ویب سائٹ کا مکمل نام) <span className="text-purple-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Shaan Online Store"
                      value={storeSettings.businessName}
                      onChange={(e) => setStoreSettings({ ...storeSettings, businessName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white font-bold"
                      id="admin-business-name-input"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Footer, About page, WhatsApp messages aur invoices par mukammal naam
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Header Display Short Name (ہیڈر کا مختصر نام) <span className="text-purple-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Shaan"
                      value={storeSettings.shortName}
                      onChange={(e) => setStoreSettings({ ...storeSettings, shortName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white font-bold"
                      id="admin-short-name-input"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Website ke top navigation bar mein logo ke sath display hone wala mukhtasir naam
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Tagline / Slogan (برانڈ کا نعرہ)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Premium Pakistani Fashion, Lifestyle & Everyday Essentials"
                      value={storeSettings.tagline}
                      onChange={(e) => setStoreSettings({ ...storeSettings, tagline: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white"
                      id="admin-tagline-input"
                    />
                  </div>
                </div>

                {/* Logo Setup Section */}
                <div className="pt-2 border-t border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                        Website Logo Options (لوگو کا انتخاب)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Aap apne device se tasweer upload kar sakte hain, image URL paste kar sakte hain ya custom letter icon rakh sakte hain
                      </p>
                    </div>
                    {storeSettings.logoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setStoreSettings((prev) => ({ ...prev, logoUrl: '' }));
                          showToast('Logo tasweer remove ho gayi, default monogram set ho gaya.', 'info');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" /> Remove Custom Image
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Method 1: File Upload */}
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                        <Upload className="w-4 h-4 text-purple-400" />
                        <span>Option A: Device se Logo Upload karein</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        PNG, JPG, SVG ya WebP format mein apne computer ya mobile se logo select karein (Max 2MB).
                      </p>
                      <label className="block">
                        <span className="sr-only">Choose logo file</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                          onChange={handleLogoFileUpload}
                          className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 file:cursor-pointer cursor-pointer"
                          id="admin-logo-file-input"
                        />
                      </label>
                    </div>

                    {/* Method 2: Image Web URL & Monogram Character */}
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                        <LinkIcon className="w-4 h-4 text-purple-400" />
                        <span>Option B: Online Image URL / Monogram</span>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Direct Image Link (Web URL)
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/store-logo.png"
                          value={storeSettings.logoUrl}
                          onChange={(e) => setStoreSettings({ ...storeSettings, logoUrl: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-lg text-xs text-white font-mono"
                          id="admin-logo-url-input"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Fallback Icon / Monogram Letter (اگر تصویر نہ ہو)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={3}
                            placeholder="ش"
                            value={storeSettings.logoIconText}
                            onChange={(e) => setStoreSettings({ ...storeSettings, logoIconText: e.target.value })}
                            className="w-16 px-3 py-1.5 bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-lg text-center font-black text-sm text-white"
                            id="admin-logo-icon-text-input"
                          />
                          <span className="text-[10px] text-slate-500">
                            Urdu ya English character (e.g. ش, S, K, 👑)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Header & Footer Preview Box */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                      Live Storefront Logo & Name Preview (لائیو پری ویو):
                    </span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Preview 1: Header Light Bar */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Header Bar (Light Theme)
                        </span>
                        <div className="flex items-center gap-2.5">
                          {storeSettings.logoUrl ? (
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shadow-xs p-1">
                              <img
                                src={storeSettings.logoUrl}
                                alt="Logo Preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold shadow-md">
                              <span className="text-xl tracking-tight">
                                {storeSettings.logoIconText || 'ش'}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xl font-black tracking-tight text-slate-900">
                                {storeSettings.shortName || storeSettings.businessName || 'Shaan'}
                                <span className="text-rose-600">.</span>
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                                Verified Store
                              </span>
                            </div>
                            <span className="block text-[9px] tracking-wider font-bold uppercase text-slate-500 -mt-0.5">
                              Pakistan • COD Available
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Preview 2: Footer Dark Bar */}
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 shadow-xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Footer Bar (Dark Theme)
                        </span>
                        <div className="flex items-center gap-2.5">
                          {storeSettings.logoUrl ? (
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-700 overflow-hidden flex items-center justify-center shadow-md p-1 shrink-0">
                              <img
                                src={storeSettings.logoUrl}
                                alt="Logo Preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-rose-600/30 shrink-0">
                              <span>{storeSettings.logoIconText || 'ش'}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-lg font-black tracking-tight text-white block leading-tight">
                              {storeSettings.businessName || 'Shaan Online Store'}
                            </span>
                            {storeSettings.tagline && (
                              <span className="text-[10px] text-rose-400 font-medium block truncate max-w-[220px]">
                                {storeSettings.tagline}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Footer Physical Address & Location */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-950/80 border border-rose-800/60 text-rose-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        2. Footer Store & Office Address (دکان / آفس کا ایڈریس)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Footer aur Contact page par display hone wala physical address aur city
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                    Footer Address
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Street Address / Shop Location <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Shop 14-B, Main Boulevard, Gulberg III"
                      value={storeSettings.address}
                      onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl text-xs text-white"
                      id="admin-address-input"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Dukan ya office ka mukammal pata (e.g. Liberty Market, Lahore)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      City (شہر) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lahore, Karachi, Islamabad"
                      value={storeSettings.city}
                      onChange={(e) => setStoreSettings({ ...storeSettings, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl text-xs text-white"
                      id="admin-city-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Country & Postal Code
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Pakistan"
                        value={storeSettings.country}
                        onChange={(e) => setStoreSettings({ ...storeSettings, country: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl text-xs text-white"
                        id="admin-country-input"
                      />
                      <input
                        type="text"
                        placeholder="e.g. 54000"
                        value={storeSettings.postalCode}
                        onChange={(e) => setStoreSettings({ ...storeSettings, postalCode: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl text-xs text-white font-mono"
                        id="admin-postal-code-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Address Preview */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Footer Live Address Preview:</span>
                    <span className="text-white font-medium">
                      {storeSettings.address ? storeSettings.address : 'Shop 14-B, Main Boulevard, Gulberg III'}
                      {storeSettings.city ? `, ${storeSettings.city}` : ', Lahore'}
                      {storeSettings.country ? `, ${storeSettings.country}` : ', Pakistan'}
                      {storeSettings.postalCode ? ` - ${storeSettings.postalCode}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Dates, Working Days & Timings */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-800/60 text-amber-400 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        3. Dates, Days & Operating Timings (تاریخ، دن اور دکان کے اوقات)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Customer ko footer par dekhne ke liye business working hours aur holiday timing
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                    Store Schedule
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Working Days / Days of Operation (کھلنے کے دن) <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Monday - Saturday ya پیر تا ہفتہ"
                      value={storeSettings.workingDays}
                      onChange={(e) => setStoreSettings({ ...storeSettings, workingDays: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-white"
                      id="admin-working-days-input"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Haftay ke kon kon se din order processing aur support available hai
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Daily Working Time / Hours (اوقاتِ کار) <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10:00 AM - 9:00 PM PKT"
                      value={storeSettings.workingTime}
                      onChange={(e) => setStoreSettings({ ...storeSettings, workingTime: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-white"
                      id="admin-working-time-input"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Dukan ya online desk ke khulne aur band hone ka waqt
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Weekend / Off-Day Status (چھٹی اور آن لائن سروس)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sunday: Closed (Online Orders Open 24/7)"
                      value={storeSettings.closedDays}
                      onChange={(e) => setStoreSettings({ ...storeSettings, closedDays: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-white"
                      id="admin-closed-days-input"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Itwar ya national holidays par dukan aur parcel dispatch ki policy
                    </p>
                  </div>
                </div>

                {/* Live Timings Preview */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Footer Live Schedule Preview:</span>
                    <span className="text-white font-medium">
                      {storeSettings.workingDays || 'Monday - Saturday'}: {storeSettings.workingTime || '10:00 AM - 9:00 PM PKT'}
                    </span>
                    {storeSettings.closedDays && (
                      <span className="text-amber-300/90 block text-[11px] mt-0.5">
                        • {storeSettings.closedDays}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: Footer About Bio & Copyright Notice */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        4. Footer About Bio & Copyright Notice (فوٹر تعارف اور کاپی رائٹ)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Footer ka introductory paragraph aur copyright notice
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60">
                    Bio & Copyright
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Footer About Bio / Store Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Pakistan's premier destination for curated artisanal footwear, luxury pret kurtas, designer unstitched lawn..."
                      value={storeSettings.aboutText}
                      onChange={(e) => setStoreSettings({ ...storeSettings, aboutText: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white"
                      id="admin-about-text-input"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Footer Copyright Text (کاپی رائٹ کا جملہ)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. All rights reserved. Designed for Pakistan."
                      value={storeSettings.copyrightText}
                      onChange={(e) => setStoreSettings({ ...storeSettings, copyrightText: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white"
                      id="admin-copyright-input"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Footer ke bottom bar par: © {new Date().getFullYear()} {storeSettings.businessName || 'Shaan Store'}. {storeSettings.copyrightText || 'All rights reserved.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 5: Contact & Social Media Links */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400 flex items-center justify-center shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        5. Phone, Email & Social Media Channels (رابطہ اور سوشل میڈیا لنکس)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Official contact email, support phone call number aur social profiles
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800/60">
                    Contact & Social
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Official Email Address <span className="text-blue-400">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="support@shaanstore.pk"
                      value={storeSettings.email}
                      onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-white"
                      id="admin-email-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Helpline Phone (Calling)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="+92 300 1234567"
                        value={storeSettings.phone}
                        onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-white font-mono"
                        id="admin-phone-input"
                      />
                      <input
                        type="text"
                        placeholder="0300-1234567"
                        value={storeSettings.phoneDisplay}
                        onChange={(e) => setStoreSettings({ ...storeSettings, phoneDisplay: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-white"
                        id="admin-phone-display-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/shaanstorepk"
                      value={storeSettings.instagram}
                      onChange={(e) => setStoreSettings({ ...storeSettings, instagram: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-white"
                      id="admin-instagram-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://facebook.com/shaanstorepk"
                      value={storeSettings.facebook}
                      onChange={(e) => setStoreSettings({ ...storeSettings, facebook: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-white"
                      id="admin-facebook-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      TikTok URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://tiktok.com/@shaanstorepk"
                      value={storeSettings.tiktok}
                      onChange={(e) => setStoreSettings({ ...storeSettings, tiktok: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-white"
                      id="admin-tiktok-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      YouTube URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/@shaanstorepk"
                      value={storeSettings.youtube}
                      onChange={(e) => setStoreSettings({ ...storeSettings, youtube: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-white"
                      id="admin-youtube-input"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: Order on WhatsApp Number */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-950/80 border border-rose-800/60 text-rose-400 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        6. Order on WhatsApp Number (آرڈر واٹس ایپ نمبر)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Products ke "Order on WhatsApp" buttons aur direct COD orders ke liye
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                    Product Order Desk
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Order WhatsApp Number (Digits only) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 923001234567"
                      value={storeSettings.orderWhatsapp}
                      onChange={(e) => setStoreSettings({ ...storeSettings, orderWhatsapp: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl text-xs text-white font-mono"
                      id="admin-order-whatsapp-digits-input"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Bina '+' ya space ke sirf country code ke sath digits (e.g. 923001234567)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Order WhatsApp Display Text <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +92 300 1234567"
                      value={storeSettings.orderWhatsappDisplay}
                      onChange={(e) => setStoreSettings({ ...storeSettings, orderWhatsappDisplay: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl text-xs text-white"
                      id="admin-order-whatsapp-display-input"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Storefront par customer ko dekhne ke liye (formatted)
                    </p>
                  </div>
                </div>

                {/* Test Order Link Bar */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono truncate">
                    <span className="text-slate-500">Preview Link:</span>
                    <span className="text-rose-400 select-all truncate">https://wa.me/{storeSettings.orderWhatsapp || '923001234567'}</span>
                  </div>
                  {storeSettings.orderWhatsapp && (
                    <a
                      href={`https://wa.me/${storeSettings.orderWhatsapp}?text=${encodeURIComponent('Test message from Shaan Store Admin: Order on WhatsApp desk is working!')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                      id="admin-test-order-whatsapp-btn"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Test Order WhatsApp Link
                    </a>
                  )}
                </div>
              </div>

              {/* SECTION 7: Helpline WhatsApp Number */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center shrink-0">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        7. Helpline WhatsApp Number (کسٹمر ہیلپ لائن واٹس ایپ نمبر)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Customer Support, Tracking inquiry, Floating WhatsApp button, Raast verification aur Footer ke liye
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                    Support & Helpline
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Helpline WhatsApp Number (Digits only) <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 923001234567"
                      value={storeSettings.helplineWhatsapp}
                      onChange={(e) => setStoreSettings({ ...storeSettings, helplineWhatsapp: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-white font-mono"
                      id="admin-helpline-whatsapp-digits-input"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Bina '+' ya space ke sirf country code ke sath digits (e.g. 923001234567)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Helpline WhatsApp Display Text <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +92 300 1234567"
                      value={storeSettings.helplineWhatsappDisplay}
                      onChange={(e) => setStoreSettings({ ...storeSettings, helplineWhatsappDisplay: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-white"
                      id="admin-helpline-whatsapp-display-input"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Storefront footer, header aur helpline support par show hoga
                    </p>
                  </div>
                </div>

                {/* Test Helpline Link Bar */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono truncate">
                    <span className="text-slate-500">Preview Link:</span>
                    <span className="text-emerald-400 select-all truncate">https://wa.me/{storeSettings.helplineWhatsapp || '923001234567'}</span>
                  </div>
                  {storeSettings.helplineWhatsapp && (
                    <a
                      href={`https://wa.me/${storeSettings.helplineWhatsapp}?text=${encodeURIComponent('Test message from Shaan Store Admin: Helpline WhatsApp support is working!')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                      id="admin-test-helpline-whatsapp-btn"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Test Helpline WhatsApp Link
                    </a>
                  )}
                </div>
              </div>

              {/* SECTION 8: SBP Raast Settings */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    8. State Bank of Pakistan (SBP) Raast Banking Settings
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Online Raast Instant Payment ke liye bank details
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={storeSettings.bankName}
                      onChange={(e) => setStoreSettings({ ...storeSettings, bankName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      id="admin-bank-name-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Account Title</label>
                    <input
                      type="text"
                      value={storeSettings.accountTitle}
                      onChange={(e) => setStoreSettings({ ...storeSettings, accountTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      id="admin-account-title-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Raast ID (Registered Mobile)</label>
                    <input
                      type="text"
                      value={storeSettings.raastId}
                      onChange={(e) => setStoreSettings({ ...storeSettings, raastId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      id="admin-raast-id-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Bank IBAN (Optional)</label>
                    <input
                      type="text"
                      value={storeSettings.iban}
                      onChange={(e) => setStoreSettings({ ...storeSettings, iban: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      id="admin-iban-input"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 9: Delivery Settings */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    9. Nationwide Delivery Settings
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Free shipping limit aur standard shipping charges
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Free Delivery Threshold (Rs.)</label>
                    <input
                      type="number"
                      value={storeSettings.freeDeliveryThreshold}
                      onChange={(e) => setStoreSettings({ ...storeSettings, freeDeliveryThreshold: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      id="admin-free-delivery-input"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Is amount se zyada ke orders par delivery free hogi (Default: Rs. 3,500)
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Standard Delivery Fee (Rs.)</label>
                    <input
                      type="number"
                      value={storeSettings.deliveryCharge}
                      onChange={(e) => setStoreSettings({ ...storeSettings, deliveryCharge: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      id="admin-delivery-fee-input"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Free delivery limit se kam orders par lagne wala delivery charge (Default: Rs. 200)
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Settings Action Bar */}
              <div className="sticky bottom-4 z-20 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
                <div className="text-xs text-slate-400 hidden sm:block">
                  Tabdeeliyan foran save ho kar poore storefront par active ho jayengi.
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  id="admin-save-settings-btn"
                >
                  <Check className="w-4 h-4" />
                  Save Store & WhatsApp Settings
                </button>
              </div>
            </form>

            {/* Danger Zone: All Reset & Factory Data Wipe */}
            <div className="bg-red-950/30 border-2 border-red-900/60 rounded-2xl p-6 shadow-xl space-y-4" id="admin-danger-zone">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Danger Zone: All Reset & Data Management
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Aap yahan se website ke orders, test data ya tamam custom items ko delete aur reset kar sakte hain.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* All Reset Button */}
                <button
                  type="button"
                  onClick={() => {
                    setResetType('all');
                    setIsResetModalOpen(true);
                  }}
                  className="p-4 rounded-xl bg-red-900/50 hover:bg-red-800/80 border border-red-700/80 text-left transition-all group cursor-pointer"
                  id="danger-all-reset-btn"
                >
                  <div className="flex items-center gap-2 text-red-200 font-extrabold text-sm mb-1 group-hover:text-white">
                    <Trash2 className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                    <span>All Reset (Wipe Everything)</span>
                  </div>
                  <p className="text-[11px] text-red-300/80 leading-relaxed">
                    Tamam orders, products, coupons aur carts saaf kar dein. Fresh shuruat ke liye.
                  </p>
                </button>

                {/* Clear Orders Only Button */}
                <button
                  type="button"
                  onClick={() => {
                    setResetType('orders');
                    setIsResetModalOpen(true);
                  }}
                  className="p-4 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 text-left transition-all group cursor-pointer"
                  id="danger-clear-orders-btn"
                >
                  <div className="flex items-center gap-2 text-amber-200 font-extrabold text-sm mb-1 group-hover:text-white">
                    <Package className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Clear All Orders Only</span>
                  </div>
                  <p className="text-[11px] text-amber-300/80 leading-relaxed">
                    Sirf customer orders aur order history ko 0 kar dein, products catalog mehfooz rahega.
                  </p>
                </button>
              </div>

              {/* Restore sample catalog / demo orders */}
              <div className="pt-3 border-t border-red-900/40 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Reset ke baad sample catalog wapis lana chahein?
                </span>
                <button
                  type="button"
                  onClick={handleRestoreDefaults}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  id="danger-restore-defaults-btn"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                  <span>Restore Default Catalog</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================== */}
        {/* TAB 8: DOWNLOAD ZIP PACKAGES (الگ الگ زپ فائلز) */}
        {/* ===================================== */}
        {activeTab === 'exports' && (
          <div className="space-y-8" id="admin-exports-section">
            {/* Header / Intro Card */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                    <Archive className="w-4 h-4" />
                    <span>Project Source Code Downloads (الگ الگ زپ فائلز)</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Website & Admin Standalone ZIP Packages
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    آپ کے مطالبے کے مطابق ویب سائٹ (Customer Storefront) اور ایڈمن پورٹل (Admin Management Panel) کو دو الگ الگ خود مختار زپ پیکجز میں تقسیم کر دیا گیا ہے۔ آپ انہیں ایک کلک پر ڈاؤنلوڈ کر کے کسی بھی سرور، VPS یا لوکل کمپیوٹر پر چلا سکتے ہیں۔
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      showToast('ZIP packages are ready and pre-compiled on server.', 'info');
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Instant Direct Download</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2 Main Separate ZIP Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* CARD 1: Customer Website ZIP */}
              <div className="bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-500/20 transition-all"></div>
                
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-lg">
                      <Globe className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-black uppercase tracking-wider">
                      Storefront Only
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white">
                      1. Customer Website Package (ویب سائٹ فائل)
                    </h3>
                    <p className="text-xs text-rose-400 font-mono mt-0.5">
                      shaan-storefront-website.zip (~136 KB)
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    یہ فائل گاہکوں کے لیے تیار کردہ مکمل آن لائن شاپ ہے۔ اس میں کوئی پوشیدہ ایڈمن پورٹل یا کنٹرول روم شامل نہیں ہے تاکہ آپ کی خفیہ ترتیبات اور ڈیٹا محفوظ رہے۔
                  </p>

                  <div className="space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-400">
                    <span className="font-bold text-white text-[11px] uppercase tracking-wider block mb-1">
                      اس زپ فائل میں شامل فیچرز:
                    </span>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>پریمیم فیشن و لائف اسٹائل ہوم پیج و فلٹرز</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>شاپنگ کارٹ (Slide-Over Drawer) و کوپن ڈسکاؤنٹ</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>کیش آن ڈیلیوری (COD) و اسٹیٹ بینک راست (Raast) چیک آؤٹ</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>واٹس ایپ ڈائریکٹ 1-Click آرڈر بٹنز</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>لائیو آرڈر ٹریکنگ (بذریعہ فون نمبر یا آرڈر آئی ڈی)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 relative z-10 space-y-2">
                  <a
                    href="/api/download/website"
                    download="shaan-storefront-website.zip"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:scale-[1.01]"
                    id="download-website-zip-btn"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Website ZIP (ویب سائٹ ڈاؤنلوڈ کریں)</span>
                  </a>
                  <p className="text-[10px] text-center text-slate-400">
                    Extract karein اور `npm install` کے بعد `npm run dev` چلائیں
                  </p>
                </div>
              </div>

              {/* CARD 2: Admin Portal ZIP */}
              <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg">
                      <Shield className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-black uppercase tracking-wider">
                      Management Only
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white">
                      2. Admin Portal Package (ایڈمن پورٹل فائل)
                    </h3>
                    <p className="text-xs text-emerald-400 font-mono mt-0.5">
                      shaan-admin-portal.zip (~165 KB)
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    یہ مکمل ایڈمن ڈیش بورڈ کی الگ فائل ہے۔ اسے آپ اپنے پاس محفوظ رکھ کر چلائیں، یہ براہِ راست ایڈمن لاگ ان اسکرین پر کھلے گا اور پورے اسٹور کا کنٹرول فراہم کرے گا۔
                  </p>

                  <div className="space-y-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-400">
                    <span className="font-bold text-white text-[11px] uppercase tracking-wider block mb-1">
                      اس زپ فائل میں شامل فیچرز:
                    </span>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>ویب سائٹ کا لوگو، مکمل نام، شارٹ نام اور سلوگن کنٹرول</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>پروڈکٹس اور انوینٹری منیجر (نئی پروڈکٹ، قیمت، ویرینٹس)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>آرڈرز مینجمنٹ و لائیو اسٹیٹس اپڈیٹ (Shipped / Delivered)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>اسٹیٹ بینک راست (Raast) اور بینک اکاؤنٹ سیٹنگز</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>کورئیر ڈسپیچ تھرمل انوائس پرنٹنگ و واٹس ایپ کسٹمر اپڈیٹ</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 relative z-10 space-y-2">
                  <a
                    href="/api/download/admin"
                    download="shaan-admin-portal.zip"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:scale-[1.01]"
                    id="download-admin-zip-btn"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Admin ZIP (ایڈمن پورٹل ڈاؤنلوڈ کریں)</span>
                  </a>
                  <p className="text-[10px] text-center text-slate-400">
                    Default Passcode: <code className="text-amber-400 font-mono">admin123</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Bonus: Full Combined Repository ZIP Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <FolderDown className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      مکمل ماسٹر پروجیکٹ زپ (Website + Admin All-in-One)
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                      shaan-store-full-project.zip (~166 KB)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-xl">
                    اگر آپ دونوں کو ایک ہی کوڈ بیس میں اکٹھا بھی محفوظ رکھنا چاہتے ہیں تو یہ ماسٹر پروجیکٹ زپ بھی دستیاب ہے۔
                  </p>
                </div>
              </div>

              <a
                href="/api/download/full"
                download="shaan-store-full-project.zip"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-md"
                id="download-full-project-zip-btn"
              >
                <Download className="w-4 h-4" />
                <span>Download Full Project ZIP</span>
              </a>
            </div>

            {/* Urdu Setup & Deployment Guide */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>زپ فائلز چلانے کا آسان طریقہ (Easy Setup Instructions)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 pt-2">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="text-emerald-400 font-bold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[10px]">1</span>
                    فائل ان زپ (Unzip) کریں
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    ڈاؤنلوڈ شدہ زپ فائل پر رائٹ کلک کر کے <strong>Extract All</strong> یا <strong>Unzip</strong> کریں۔
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="text-amber-400 font-bold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center text-[10px]">2</span>
                    ڈیپینڈینسیز انسٹال کریں
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed font-mono">
                    ٹرمینل / کمانڈ پرامپٹ میں جا کر <code className="text-amber-300">npm install</code> لکھ کر اینٹر دبائیں۔
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="text-cyan-400 font-bold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[10px]">3</span>
                    ایپ چلائیں یا پبلش کریں
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed font-mono">
                    لوکل چلانے کے لیے <code className="text-cyan-300">npm run dev</code> اور لائیو سرور کے لیے <code className="text-cyan-300">npm run build</code> چلائیں۔
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================================== */}
      {/* MODAL: ORDER DETAILS / INVOICE SLIP */}
      {/* ===================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-rose-400">Order #{selectedOrder.orderId}</span>
                <h3 className="text-lg font-black text-white">{selectedOrder.customerName}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-1">Customer Contact</span>
                <div className="text-white font-semibold">{selectedOrder.customerName}</div>
                <div className="text-slate-300 font-mono mt-0.5">{selectedOrder.customerPhone}</div>
                {selectedOrder.customerEmail && (
                  <div className="text-slate-400">{selectedOrder.customerEmail}</div>
                )}
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Delivery Address</span>
                <div className="text-white">{selectedOrder.deliveryAddress}</div>
                <div className="text-slate-300 font-bold mt-0.5">
                  {selectedOrder.city} {selectedOrder.postalCode ? `(${selectedOrder.postalCode})` : ''}
                </div>
                {selectedOrder.orderNotes && (
                  <div className="text-amber-300 text-[11px] mt-1 italic">
                    Note: "{selectedOrder.orderNotes}"
                  </div>
                )}
              </div>
            </div>

            {/* Ordered Items Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Ordered Items ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=120'}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-lg border border-slate-800 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-400">
                          Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="font-black text-white text-right">
                      Rs. {item.total.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>Rs. {selectedOrder.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Nationwide Shipping:</span>
                <span>{selectedOrder.shipping === 0 ? 'FREE' : `Rs. ${selectedOrder.shipping}`}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount ({selectedOrder.couponCode || 'Promo'}):</span>
                  <span>- Rs. {selectedOrder.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                <span>Total Payable:</span>
                <span>Rs. {selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Status Modifiers */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">Order Status:</span>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) =>
                    handleUpdateOrderStatus(selectedOrder.orderId, e.target.value as OrderStatus)
                  }
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">Payment:</span>
                <button
                  onClick={() =>
                    handleUpdatePaymentStatus(
                      selectedOrder.orderId,
                      selectedOrder.paymentStatus === 'paid' ? 'pending' : 'paid'
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer border ${
                    selectedOrder.paymentStatus === 'paid'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}
                >
                  {selectedOrder.paymentStatus === 'paid' ? '✓ Mark as Paid' : 'Mark as Pending'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <a
                href={getWhatsAppOrderLink(selectedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact on WhatsApp</span>
              </a>

              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice / Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* MODAL: ADD NEW PRODUCT */}
      {/* ===================================== */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl sm:max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  Add New Product to Store
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Naya product create karein aur 6 tasweerain, colours aur sizes set karein
                </p>
              </div>
              <button
                onClick={() => setIsAddProductModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="space-y-5 text-xs">
              {/* UNIFIED PRIMARY SECTION: PRODUCT NAME, CATEGORY & 6 IMAGES UPLOAD */}
              <div className="p-4 sm:p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-[11px]">
                      1
                    </span>
                    <span className="font-bold text-white text-sm">
                      Product Name, Category & 6 Images
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Pehli tasweer website par main cover photo hogi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  <div className="sm:col-span-7">
                    <label className="block text-slate-300 font-bold mb-1.5">
                      Product Name (پروڈکٹ کا نام) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="e.g. Peshawari Chappal Zalmi Edition"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-slate-300 font-bold mb-1.5">
                      Category Select (کیٹیگری منتخب کریں) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500 text-xs cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 6 Images Uploader inside this same unified section */}
                <div className="pt-2 border-t border-slate-800/80">
                  <ProductImagesUploader
                    images={newProduct.images || (newProduct.image ? [newProduct.image] : [])}
                    onChange={(imgs) => setNewProduct({ ...newProduct, images: imgs, image: imgs[0] || '' })}
                    maxImages={6}
                    idPrefix="new-product-imgs"
                  />
                </div>
              </div>

              {/* ATTRIBUTES SECTION: COLOUR & SIZE */}
              <div className="p-4 sm:p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-[11px]">
                      2
                    </span>
                    <span className="font-bold text-white text-sm">
                      Product Attributes: Colour & Size (Rang aur Naap)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Customers ke liye pasandida rang aur sizes
                  </span>
                </div>

                {/* Colour Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-rose-400" />
                      <span>Available Colours (Dastiyab Rang - Comma separated)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Chips par click kar ke add/remove karein</span>
                  </div>

                  <input
                    type="text"
                    value={newProduct.colors}
                    onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                    placeholder="e.g. Black, Brown, Tan, Navy Blue, Maroon"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500 text-xs"
                  />

                  {/* Popular Colour Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 mr-1 font-semibold">Quick Add:</span>
                    {POPULAR_COLORS.map((col) => {
                      const activeList = newProduct.colors
                        .split(',')
                        .map((c) => c.trim().toLowerCase())
                        .filter(Boolean);
                      const isSelected = activeList.includes(col.name.toLowerCase());
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() =>
                            setNewProduct({
                              ...newProduct,
                              colors: toggleColorInString(newProduct.colors, col.name),
                            })
                          }
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-rose-600/25 border-rose-500 text-rose-200 shadow-xs'
                              : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-slate-600 shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span>{col.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Selected Colour Tags */}
                  {newProduct.colors
                    .split(',')
                    .map((c) => c.trim())
                    .filter(Boolean).length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">Active:</span>
                      {newProduct.colors
                        .split(',')
                        .map((c) => c.trim())
                        .filter(Boolean)
                        .map((colName, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-md text-[11px] flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span>{colName}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setNewProduct({
                                  ...newProduct,
                                  colors: removeColorFromString(newProduct.colors, colName),
                                })
                              }
                              className="text-slate-400 hover:text-white cursor-pointer ml-0.5"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Size Selection */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-pink-400" />
                      <span>Available Sizes (Dastiyab Sizes / Naap - Comma separated)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Presets par click karein ya type karein</span>
                  </div>

                  <input
                    type="text"
                    value={newProduct.sizes}
                    onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                    placeholder="e.g. 40, 41, 42, 43, 44 or S, M, L, XL"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500 text-xs"
                  />

                  {/* Size Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 mr-1 font-semibold">Presets:</span>
                    {SIZE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setNewProduct({ ...newProduct, sizes: preset.value })}
                        className="px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-900 border border-slate-700 text-slate-300 hover:border-pink-500/70 hover:text-pink-300 transition-all cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Active Selected Size Tags */}
                  {newProduct.sizes
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean).length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">Active:</span>
                      {newProduct.sizes
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((sizeVal, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-md text-[11px] flex items-center gap-1.5"
                          >
                            <span className="font-mono text-pink-400 text-[10px]">#</span>
                            <span>{sizeVal}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setNewProduct({
                                  ...newProduct,
                                  sizes: removeSizeFromString(newProduct.sizes, sizeVal),
                                })
                              }
                              className="text-slate-400 hover:text-white cursor-pointer ml-0.5"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* PRICING, STOCK & SKU */}
              <div className="p-4 sm:p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[11px]">
                    3
                  </span>
                  <span className="font-bold text-white text-sm">Pricing & Inventory (Qeemat aur Stock)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Regular Price (اصل قیمت - Rs.) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                      placeholder="e.g. 3500"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Sale Price (رعایتی قیمت - Optional)
                    </label>
                    <input
                      type="number"
                      value={newProduct.salePrice}
                      onChange={(e) => setNewProduct({ ...newProduct, salePrice: Number(e.target.value) })}
                      placeholder="e.g. 2990"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Stock Units (اسٹاک کی تعداد) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                      placeholder="e.g. 25"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      SKU Code (پروڈکٹ کوڈ)
                    </label>
                    <input
                      type="text"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      placeholder="e.g. SKU-1001"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* PRODUCT DETAIL & BADGES */}
              <div className="p-4 sm:p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                  <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-[11px]">
                    4
                  </span>
                  <span className="font-bold text-white text-sm">
                    Product Detail & Description (پروڈکٹ کی مکمل تفصیل)
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Product Detail (پروڈکٹ کی تفصیل و خصوصیات)
                  </label>
                  <textarea
                    rows={3}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Crafted with pure leather and precision stitching. Lightweight, durable and authentic handmade..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={newProduct.featured}
                      onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                      className="rounded text-rose-600 bg-slate-900 border-slate-700"
                    />
                    <span>Featured on Homepage</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={newProduct.isNew}
                      onChange={(e) => setNewProduct({ ...newProduct, isNew: e.target.checked })}
                      className="rounded text-rose-600 bg-slate-900 border-slate-700"
                    />
                    <span>New Arrival Badge</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* MODAL: EDIT PRODUCT */}
      {/* ===================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl sm:max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-rose-500" />
                  Edit Product Details
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Product name, category, 6 tasweerain, colours aur sizes update karein
                </p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="space-y-5 text-xs">
              {/* UNIFIED PRIMARY SECTION: PRODUCT NAME, CATEGORY & 6 IMAGES UPLOAD */}
              <div className="p-4 sm:p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-[11px]">
                      1
                    </span>
                    <span className="font-bold text-white text-sm">
                      Product Name, Category & 6 Images
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Pehli tasweer website par main cover photo hogi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  <div className="sm:col-span-7">
                    <label className="block text-slate-300 font-bold mb-1.5">
                      Product Name (پروڈکٹ کا نام) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      placeholder="e.g. Peshawari Chappal Zalmi Edition"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-slate-300 font-bold mb-1.5">
                      Category Select (کیٹیگری منتخب کریں) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500 text-xs cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 6 Images Uploader inside this same unified section */}
                <div className="pt-2 border-t border-slate-800/80">
                  <ProductImagesUploader
                    images={editingProduct.images || []}
                    onChange={(imgs) => setEditingProduct({ ...editingProduct, images: imgs })}
                    maxImages={6}
                    idPrefix="edit-product-imgs"
                  />
                </div>
              </div>

              {/* ATTRIBUTES SECTION: COLOUR & SIZE */}
              <div className="p-4 sm:p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-[11px]">
                      2
                    </span>
                    <span className="font-bold text-white text-sm">
                      Product Attributes: Colour & Size (Rang aur Naap)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Customers ke liye pasandida rang aur sizes
                  </span>
                </div>

                {/* Colour Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-rose-400" />
                      <span>Available Colours (Dastiyab Rang - Comma separated)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Chips par click kar ke add/remove karein</span>
                  </div>

                  <input
                    type="text"
                    value={editingColors}
                    onChange={(e) => setEditingColors(e.target.value)}
                    placeholder="e.g. Black, Brown, Tan, Navy Blue, Maroon"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500 text-xs"
                  />

                  {/* Popular Colour Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 mr-1 font-semibold">Quick Add:</span>
                    {POPULAR_COLORS.map((col) => {
                      const activeList = editingColors
                        .split(',')
                        .map((c) => c.trim().toLowerCase())
                        .filter(Boolean);
                      const isSelected = activeList.includes(col.name.toLowerCase());
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => setEditingColors(toggleColorInString(editingColors, col.name))}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-rose-600/25 border-rose-500 text-rose-200 shadow-xs'
                              : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-slate-600 shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span>{col.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Selected Colour Tags */}
                  {editingColors
                    .split(',')
                    .map((c) => c.trim())
                    .filter(Boolean).length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">Active:</span>
                      {editingColors
                        .split(',')
                        .map((c) => c.trim())
                        .filter(Boolean)
                        .map((colName, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-md text-[11px] flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span>{colName}</span>
                            <button
                              type="button"
                              onClick={() => setEditingColors(removeColorFromString(editingColors, colName))}
                              className="text-slate-400 hover:text-white cursor-pointer ml-0.5"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Size Selection */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-pink-400" />
                      <span>Available Sizes (Dastiyab Sizes / Naap - Comma separated)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Presets par click karein ya type karein</span>
                  </div>

                  <input
                    type="text"
                    value={editingSizes}
                    onChange={(e) => setEditingSizes(e.target.value)}
                    placeholder="e.g. 40, 41, 42, 43, 44 or S, M, L, XL"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-rose-500 text-xs"
                  />

                  {/* Size Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 mr-1 font-semibold">Presets:</span>
                    {SIZE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setEditingSizes(preset.value)}
                        className="px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-900 border border-slate-700 text-slate-300 hover:border-pink-500/70 hover:text-pink-300 transition-all cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Active Selected Size Tags */}
                  {editingSizes
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean).length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">Active:</span>
                      {editingSizes
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((sizeVal, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-md text-[11px] flex items-center gap-1.5"
                          >
                            <span className="font-mono text-pink-400 text-[10px]">#</span>
                            <span>{sizeVal}</span>
                            <button
                              type="button"
                              onClick={() => setEditingSizes(removeSizeFromString(editingSizes, sizeVal))}
                              className="text-slate-400 hover:text-white cursor-pointer ml-0.5"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* PRICING & INVENTORY (REGULAR PRICE, SALE PRICE, STOCK UNITS, SKU CODE) */}
              <div className="p-4 sm:p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[11px]">
                    3
                  </span>
                  <span className="font-bold text-white text-sm">
                    Pricing & Inventory (قیمت، اسٹاک اور SKU کوڈ)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Regular Price (اصل قیمت - Rs.) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Sale Price (رعایتی قیمت - Optional)
                    </label>
                    <input
                      type="number"
                      value={editingProduct.salePrice || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          salePrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="e.g. 2990"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Stock Units (اسٹاک کی تعداد) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      SKU Code (پروڈکٹ کوڈ)
                    </label>
                    <input
                      type="text"
                      value={editingProduct.sku || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                      placeholder="e.g. SKU-1001"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* PRODUCT DETAIL & DESCRIPTION */}
              <div className="p-4 sm:p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                  <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-[11px]">
                    4
                  </span>
                  <span className="font-bold text-white text-sm">
                    Product Detail & Description (پروڈکٹ کی مکمل تفصیل)
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Product Detail (پروڈکٹ کی تفصیل و خصوصیات)
                  </label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Crafted with pure leather and precision stitching. Lightweight and durable for daily wear..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={editingProduct.featured}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                      className="rounded text-rose-600 bg-slate-900 border-slate-700"
                    />
                    <span>Featured on Homepage</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={editingProduct.isNew}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isNew: e.target.checked })}
                      className="rounded text-rose-600 bg-slate-900 border-slate-700"
                    />
                    <span>New Arrival Badge</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* MODAL: CREATE COUPON */}
      {/* ===================================== */}
      {isAddCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Create Discount Coupon</h3>
              <button
                onClick={() => setIsAddCouponModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCouponSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Coupon Code (e.g. EID2026)</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="SHAAN20"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Discount Type</label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="percentage">% Percentage Off</option>
                    <option value="fixed">Fixed PKR Off</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                    placeholder="10 or 500"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Minimum Order (Rs.)</label>
                  <input
                    type="number"
                    value={newCoupon.minimumOrder}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minimumOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Max Discount Cap (Rs.)</label>
                  <input
                    type="number"
                    value={newCoupon.maximumDiscount || ''}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        maximumDiscount: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* MODAL: ADD CATEGORY */}
      {/* ===================================== */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-400">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Add New Category</h3>
                  <p className="text-[11px] text-slate-400">Create a department for products & circular home pills</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Category Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leather Peshawari Footwear"
                  value={newCategory.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewCategory({
                      ...newCategory,
                      name,
                      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  URL Slug <span className="text-slate-500 font-normal">(Used in filters & URLs)</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-slate-800 border border-r-0 border-slate-700 rounded-l-xl text-slate-400 font-mono text-xs">
                    /category/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="leather-peshawari"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-r-xl text-white font-mono text-xs focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description for category banner and SEO..."
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-hidden focus:border-rose-500 resize-none"
                />
              </div>

              <ImageUploader
                label="Category Cover Image (Tasweer Upload Karein)"
                value={newCategory.image}
                onChange={(img) => setNewCategory({ ...newCategory, image: img })}
                aspectRatio="video"
                recommendedSize="800x600px or 16:9"
                maxDimension={900}
                idPrefix="new-category-img"
                required
              />

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl cursor-pointer shadow-lg shadow-rose-600/30"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* MODAL: EDIT CATEGORY */}
      {/* ===================================== */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-400">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Edit Category</h3>
                  <p className="text-[11px] text-slate-400">ID: {editingCategory.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">URL Slug</label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500 resize-none"
                />
              </div>

              <ImageUploader
                label="Category Cover Image (Tasweer Upload Karein)"
                value={editingCategory.image}
                onChange={(img) => setEditingCategory({ ...editingCategory, image: img })}
                aspectRatio="video"
                recommendedSize="800x600px or 16:9"
                maxDimension={900}
                idPrefix="edit-category-img"
                required
              />

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* MODAL: ADD PROMOTIONAL BANNER */}
      {/* ===================================== */}
      {isAddBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Create Promotional Hero Banner</h3>
                  <p className="text-[11px] text-slate-400">Add interactive slide to the top homepage carousel</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddBannerModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBannerSubmit} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Top Tag / Campaign Pill <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🔥 MEGA FESTIVE SALE 2026"
                    value={newBanner.tag}
                    onChange={(e) => setNewBanner({ ...newBanner, tag: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Offer Badge (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. FLAT 25% OFF"
                    value={newBanner.badge || ''}
                    onChange={(e) => setNewBanner({ ...newBanner, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Main Headline <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pakistan's Finest Handcrafted Footwear & Fashion"
                  value={newBanner.headline}
                  onChange={(e) => setNewBanner({ ...newBanner, headline: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Subheadline / Narrative</label>
                <textarea
                  rows={2}
                  placeholder="Detailed description or festive greeting..."
                  value={newBanner.subheadline}
                  onChange={(e) => setNewBanner({ ...newBanner, subheadline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Offer Coupon / Guarantee Note</label>
                <input
                  type="text"
                  placeholder='e.g. Use code "SHAAN10" for extra 10% off'
                  value={newBanner.offerCode || ''}
                  onChange={(e) => setNewBanner({ ...newBanner, offerCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <ImageUploader
                label="Banner Background Image (Tasweer Upload Karein)"
                value={newBanner.bgImage}
                onChange={(img) => setNewBanner({ ...newBanner, bgImage: img })}
                aspectRatio="banner"
                recommendedSize="1600x600px widescreen"
                maxDimension={1400}
                idPrefix="new-banner-img"
                required
              />

              {/* Action Buttons Configuration */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <span className="font-bold text-rose-400 block text-[11px] uppercase tracking-wider">
                  Call-to-Action Buttons
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-1">
                    <label className="block text-slate-400 font-medium mb-1">Primary Btn Text</label>
                    <input
                      type="text"
                      placeholder="Shop Best Sellers"
                      value={newBanner.primaryBtnText}
                      onChange={(e) => setNewBanner({ ...newBanner, primaryBtnText: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Action Type</label>
                    <select
                      value={newBanner.primaryLinkType}
                      onChange={(e) =>
                        setNewBanner({
                          ...newBanner,
                          primaryLinkType: e.target.value as 'shop' | 'category' | 'deal',
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="shop">Browse Catalog</option>
                      <option value="category">Category Link</option>
                      <option value="deal">Deals Section</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Destination Filter</label>
                    <input
                      type="text"
                      placeholder="featured or category slug"
                      value={newBanner.primaryLinkValue || ''}
                      onChange={(e) => setNewBanner({ ...newBanner, primaryLinkValue: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="sm:col-span-1">
                    <label className="block text-slate-400 font-medium mb-1">Secondary Btn Text</label>
                    <input
                      type="text"
                      placeholder="Explore Chappals"
                      value={newBanner.secondaryBtnText || ''}
                      onChange={(e) => setNewBanner({ ...newBanner, secondaryBtnText: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Action Type</label>
                    <select
                      value={newBanner.secondaryLinkType || 'category'}
                      onChange={(e) =>
                        setNewBanner({
                          ...newBanner,
                          secondaryLinkType: e.target.value as 'shop' | 'category' | 'deal' | 'contact',
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="category">Category Link</option>
                      <option value="shop">Browse Catalog</option>
                      <option value="contact">Contact WhatsApp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Destination Value</label>
                    <input
                      type="text"
                      placeholder="e.g. footwear-chappal"
                      value={newBanner.secondaryLinkValue || ''}
                      onChange={(e) => setNewBanner({ ...newBanner, secondaryLinkValue: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="new-banner-active"
                  checked={newBanner.isActive}
                  onChange={(e) => setNewBanner({ ...newBanner, isActive: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded bg-slate-950 border-slate-700"
                />
                <label htmlFor="new-banner-active" className="text-slate-300 font-bold cursor-pointer">
                  Activate banner on storefront immediately
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddBannerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl cursor-pointer shadow-lg shadow-rose-600/30"
                >
                  Create Banner Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* MODAL: EDIT PROMOTIONAL BANNER */}
      {/* ===================================== */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-400">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Edit Promotional Banner</h3>
                  <p className="text-[11px] text-slate-400">ID: {editingBanner.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditBannerSubmit} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Top Tag / Campaign Pill</label>
                  <input
                    type="text"
                    required
                    value={editingBanner.tag}
                    onChange={(e) => setEditingBanner({ ...editingBanner, tag: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Offer Badge</label>
                  <input
                    type="text"
                    value={editingBanner.badge || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Main Headline</label>
                <input
                  type="text"
                  required
                  value={editingBanner.headline}
                  onChange={(e) => setEditingBanner({ ...editingBanner, headline: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Subheadline</label>
                <textarea
                  rows={2}
                  value={editingBanner.subheadline}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subheadline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Offer Coupon / Note</label>
                <input
                  type="text"
                  value={editingBanner.offerCode || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, offerCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <ImageUploader
                label="Banner Background Image (Tasweer Upload Karein)"
                value={editingBanner.bgImage}
                onChange={(img) => setEditingBanner({ ...editingBanner, bgImage: img })}
                aspectRatio="banner"
                recommendedSize="1600x600px widescreen"
                maxDimension={1400}
                idPrefix="edit-banner-img"
                required
              />

              {/* CTAs */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <span className="font-bold text-amber-400 block text-[11px] uppercase tracking-wider">
                  Call-to-Action Buttons
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-1">
                    <label className="block text-slate-400 font-medium mb-1">Primary Btn Text</label>
                    <input
                      type="text"
                      value={editingBanner.primaryBtnText}
                      onChange={(e) => setEditingBanner({ ...editingBanner, primaryBtnText: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Action Type</label>
                    <select
                      value={editingBanner.primaryLinkType}
                      onChange={(e) =>
                        setEditingBanner({
                          ...editingBanner,
                          primaryLinkType: e.target.value as 'shop' | 'category' | 'deal',
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="shop">Browse Catalog</option>
                      <option value="category">Category Link</option>
                      <option value="deal">Deals Section</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Destination Filter</label>
                    <input
                      type="text"
                      value={editingBanner.primaryLinkValue || ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, primaryLinkValue: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="sm:col-span-1">
                    <label className="block text-slate-400 font-medium mb-1">Secondary Btn Text</label>
                    <input
                      type="text"
                      value={editingBanner.secondaryBtnText || ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, secondaryBtnText: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Action Type</label>
                    <select
                      value={editingBanner.secondaryLinkType || 'category'}
                      onChange={(e) =>
                        setEditingBanner({
                          ...editingBanner,
                          secondaryLinkType: e.target.value as 'shop' | 'category' | 'deal' | 'contact',
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="category">Category Link</option>
                      <option value="shop">Browse Catalog</option>
                      <option value="contact">Contact WhatsApp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Destination Value</label>
                    <input
                      type="text"
                      value={editingBanner.secondaryLinkValue || ''}
                      onChange={(e) => setEditingBanner({ ...editingBanner, secondaryLinkValue: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-banner-active"
                  checked={editingBanner.isActive}
                  onChange={(e) => setEditingBanner({ ...editingBanner, isActive: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded bg-slate-950 border-slate-700"
                />
                <label htmlFor="edit-banner-active" className="text-slate-300 font-bold cursor-pointer">
                  Banner is active on storefront
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* MODAL: ALL RESET CONFIRMATION */}
      {/* ===================================== */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-600/80 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-950 border border-red-700 text-red-400 flex items-center justify-center font-black">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {resetType === 'all' ? 'All Reset (Delete Everything)' : 'Clear All Orders'}
                  </h3>
                  <span className="text-[10px] text-red-400 font-extrabold uppercase tracking-wider">
                    Irreversible Action • Warning
                  </span>
                </div>
              </div>
              <button
                onClick={() => !resetting && setIsResetModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-red-950/40 border border-red-800/50 rounded-2xl p-4 text-xs text-red-200 space-y-2">
              <p className="font-bold text-white">
                {resetType === 'all'
                  ? 'Kya aap sach mein sab kuch delete aur reset karna chahte hain?'
                  : 'Kya aap tamam customer orders ko delete karna chahte hain?'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {resetType === 'all' ? (
                  <>
                    <li>Tamam customer orders aur unki history delete ho jayegi.</li>
                    <li>Gross Revenue aur sales stats 0 ho jayenge.</li>
                    <li>Custom products aur categories delete ho jayengi.</li>
                    <li>Discount coupons aur active cart items khatam ho jayenge.</li>
                  </>
                ) : (
                  <>
                    <li>Tamam customer orders aur unki history delete ho jayegi.</li>
                    <li>Dashboard revenue aur orders count 0 ho jayenge.</li>
                    <li>Aapke products aur coupons bilkul safe rahenge.</li>
                  </>
                )}
              </ul>
            </div>

            {/* Switch between All Reset and Orders Only */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setResetType('all')}
                className={`py-2 font-bold rounded-lg transition-all cursor-pointer ${
                  resetType === 'all'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Wipe Everything
              </button>
              <button
                type="button"
                onClick={() => setResetType('orders')}
                className={`py-2 font-bold rounded-lg transition-all cursor-pointer ${
                  resetType === 'orders'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Only Orders
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={resetting}
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={handleExecuteReset}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all"
                id="confirm-all-reset-btn"
              >
                {resetting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Resetting Data...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {resetType === 'all' ? 'Yes, Delete Everything' : 'Yes, Delete All Orders'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
