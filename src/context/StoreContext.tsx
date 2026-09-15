import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Category, CartItem, Coupon, CustomerProfile, Banner } from '../types';
import { initialProducts, initialCategories, initialCoupons, initialBanners } from '../services/productData';
import { businessConfig } from '../config/businessConfig';
import { validateCouponCode, clearAllOrdersAdmin } from '../services/orderService';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  // Products
  products: Product[];
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  restoreDefaultCategories: () => void;

  // Banners
  banners: Banner[];
  addBanner: (banner: Omit<Banner, 'id'>) => Banner;
  updateBanner: (id: string, updates: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  toggleBannerActive: (id: string) => void;
  restoreDefaultBanners: () => void;

  // Coupons
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (code: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (code: string) => void;

  // Reset Everything
  resetAllStoreData: () => Promise<void>;
  restoreDefaultCatalog: () => void;

  // Cart
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  appliedCoupon: Coupon | null;
  freeShippingThreshold: number;
  freeShippingProgress: number;
  amountNeededForFreeShipping: number;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Auth & Profile
  user: User | null;
  customerProfile: CustomerProfile | null;
  authLoading: boolean;
  signInWithGoogle: () => Promise<boolean>;
  signOutUser: () => Promise<void>;
  updateProfileData: (data: Partial<CustomerProfile>) => Promise<void>;

  // UI State
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Search & Filter Global State
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'shaan_store_cart_v1';
const WISHLIST_STORAGE_KEY = 'shaan_store_wishlist_v1';
const COUPON_STORAGE_KEY = 'shaan_store_coupon_v1';
const PRODUCTS_STORAGE_KEY = 'shaan_store_products_v2';
const COUPONS_STORAGE_KEY = 'shaan_store_coupons_v2';
const CATEGORIES_STORAGE_KEY = 'shaan_store_categories_v2';
const BANNERS_STORAGE_KEY = 'shaan_store_banners_v2';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(COUPONS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialCoupons;
    } catch {
      return initialCoupons;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialCategories;
    } catch {
      return initialCategories;
    }
  });

  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const saved = localStorage.getItem(BANNERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialBanners;
    } catch {
      return initialBanners;
    }
  });

  // Admin Product Actions
  const addProduct = (newProductData: Omit<Product, 'id'>): Product => {
    const id = `prod-${Date.now()}`;
    const product: Product = { ...newProductData, id };
    setProducts((prev) => {
      const updated = [product, ...prev];
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist products:', e);
      }
      return updated;
    });
    return product;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist products:', e);
      }
      return updated;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist products:', e);
      }
      return updated;
    });
  };

  // Admin Coupon Actions
  const addCoupon = (coupon: Coupon) => {
    setCoupons((prev) => {
      const updated = [coupon, ...prev.filter((c) => c.code !== coupon.code)];
      try {
        localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist coupons:', e);
      }
      return updated;
    });
  };

  const updateCoupon = (code: string, updates: Partial<Coupon>) => {
    setCoupons((prev) => {
      const updated = prev.map((c) => (c.code === code ? { ...c, ...updates } : c));
      try {
        localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist coupons:', e);
      }
      return updated;
    });
  };

  const deleteCoupon = (code: string) => {
    setCoupons((prev) => {
      const updated = prev.filter((c) => c.code !== code);
      try {
        localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist coupons:', e);
      }
      return updated;
    });
  };

  // Admin Category Actions
  const addCategory = (newCat: Omit<Category, 'id'>): Category => {
    const id = newCat.slug || `cat-${Date.now()}`;
    const category: Category = { ...newCat, id };
    setCategories((prev) => {
      const updated = [...prev, category];
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist categories:', e);
      }
      return updated;
    });
    return category;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist categories:', e);
      }
      return updated;
    });
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist categories:', e);
      }
      return updated;
    });
  };

  const restoreDefaultCategories = () => {
    setCategories(initialCategories);
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(initialCategories));
    } catch (e) {
      console.error('Failed to restore categories:', e);
    }
  };

  // Admin Banner Actions
  const addBanner = (newBannerData: Omit<Banner, 'id'>): Banner => {
    const id = `banner-${Date.now()}`;
    const banner: Banner = { ...newBannerData, id };
    setBanners((prev) => {
      const updated = [...prev, banner];
      try {
        localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist banners:', e);
      }
      return updated;
    });
    return banner;
  };

  const updateBanner = (id: string, updates: Partial<Banner>) => {
    setBanners((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, ...updates } : b));
      try {
        localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist banners:', e);
      }
      return updated;
    });
  };

  const deleteBanner = (id: string) => {
    setBanners((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist banners:', e);
      }
      return updated;
    });
  };

  const toggleBannerActive = (id: string) => {
    setBanners((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b));
      try {
        localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to toggle banner active:', e);
      }
      return updated;
    });
  };

  const restoreDefaultBanners = () => {
    setBanners(initialBanners);
    try {
      localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(initialBanners));
    } catch (e) {
      console.error('Failed to restore banners:', e);
    }
  };

  // Admin Master Reset
  const resetAllStoreData = async () => {
    // 1. Wipe all orders
    await clearAllOrdersAdmin();

    // 2. Clear products
    setProducts([]);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }

    // 3. Clear coupons
    setCoupons([]);
    try {
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }

    // 4. Clear cart & wishlist & coupon
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    setWishlist([]);
    setAppliedCoupon(null);
  };

  const restoreDefaultCatalog = () => {
    setProducts(initialProducts);
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialProducts));
    } catch (e) {
      console.error(e);
    }

    setCoupons(initialCoupons);
    try {
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(initialCoupons));
    } catch (e) {
      console.error(e);
    }
  };

  // Cart State with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Wishlist State with localStorage persistence
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // UI State
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [globalSearch, setGlobalSearch] = useState('');

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cart]);

  // Persist wishlist
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to persist wishlist:', e);
    }
  }, [wishlist]);

  // Persist coupon
  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist coupon:', e);
    }
  }, [appliedCoupon]);

  // Auth Listener & Profile Fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setCustomerProfile(userDoc.data() as CustomerProfile);
          } else {
            // Initialize basic profile
            const newProfile: CustomerProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'Customer',
              email: firebaseUser.email || '',
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setCustomerProfile(newProfile);
          }
        } catch (err) {
          console.warn('Could not sync user profile with Firestore:', err);
        }
      } else {
        setCustomerProfile(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Google Sign-In with popup
  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        showToast(`Welcome back, ${result.user.displayName || 'Customer'}!`, 'success');
        return true;
      }
      return false;
    } catch (error: unknown) {
      const authError = error as { code?: string; message?: string };
      const errorCode = authError?.code || '';

      // Expected cancellation when user closes popup window or cancels prompt
      if (
        errorCode === 'auth/popup-closed-by-user' ||
        errorCode === 'auth/cancelled-popup-request' ||
        errorCode === 'auth/user-cancelled'
      ) {
        console.info('Google sign-in popup was closed by user.');
        return false;
      }

      // Browser blocked the popup window
      if (errorCode === 'auth/popup-blocked') {
        console.warn('Google sign-in popup was blocked by browser.');
        showToast('Sign-in popup was blocked by browser. Please allow popups or open the app in a new tab.', 'info');
        return false;
      }

      // Domain not whitelisted in Firebase Auth settings
      if (errorCode === 'auth/unauthorized-domain') {
        console.warn('Current domain is not authorized in Firebase Auth.');
        showToast('To complete sign-in, please open the app in a new tab.', 'info');
        return false;
      }

      // Other unexpected errors
      console.warn('Sign-in notice:', authError?.message || error);
      showToast('Could not sign in with Google. Please try again.', 'error');
      return false;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      showToast('Logged out successfully', 'info');
    } catch (error) {
      console.warn('Sign-out notice:', error);
    }
  };

  const updateProfileData = async (data: Partial<CustomerProfile>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const updated = {
        ...(customerProfile || {}),
        ...data,
        uid: user.uid,
        email: user.email || customerProfile?.email || '',
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userRef, updated, { merge: true });
      setCustomerProfile(updated as CustomerProfile);
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        const maxStock = product.stock || 99;
        next[existingIndex].quantity = Math.min(newQty, maxStock);
        return next;
      } else {
        return [
          ...prev,
          {
            product,
            quantity: Math.min(quantity, product.stock || 99),
            selectedSize: size || (product.sizes ? product.sizes[0] : undefined),
            selectedColor: color || (product.colors ? product.colors[0] : undefined),
          },
        ];
      }
    });

    showToast(`Added "${product.name.slice(0, 30)}..." to cart`, 'success');
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
          )
      )
    );
    showToast('Item removed from cart', 'info');
  };

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (
          item.product.id === productId &&
          item.selectedSize === size &&
          item.selectedColor === color
        ) {
          const maxStock = item.product.stock || 99;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const result = await validateCouponCode(code, subtotal);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      showToast(result.message, 'success');
      return { success: true, message: result.message };
    } else {
      showToast(result.message, 'error');
      return { success: false, message: result.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Added to wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Computed Cart Totals
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const effectivePrice = item.product.salePrice ?? item.product.price;
      return acc + effectivePrice * item.quantity;
    }, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const freeShippingThreshold = businessConfig.deliverySettings.freeDeliveryThreshold;
  const deliveryCharge = businessConfig.deliverySettings.deliveryCharge;

  const shipping = useMemo(() => {
    if (cart.length === 0) return 0;
    return subtotal >= freeShippingThreshold ? 0 : deliveryCharge;
  }, [cart.length, subtotal, freeShippingThreshold, deliveryCharge]);

  const discount = useMemo(() => {
    if (!appliedCoupon || subtotal === 0) return 0;
    if (subtotal < appliedCoupon.minimumOrder) return 0;

    if (appliedCoupon.type === 'percentage') {
      const calculated = Math.round((subtotal * appliedCoupon.value) / 100);
      return appliedCoupon.maximumDiscount ? Math.min(calculated, appliedCoupon.maximumDiscount) : calculated;
    } else {
      return appliedCoupon.value;
    }
  }, [appliedCoupon, subtotal]);

  const total = useMemo(() => {
    if (cart.length === 0) return 0;
    return Math.max(0, subtotal + shipping - discount);
  }, [cart.length, subtotal, shipping, discount]);

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const getProductById = (id: string) => products.find((p) => p.id === id);
  const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug);

  const value = {
    products,
    getProductById,
    getProductBySlug,
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
    cart,
    cartCount,
    subtotal,
    shipping,
    discount,
    total,
    appliedCoupon,
    freeShippingThreshold,
    freeShippingProgress,
    amountNeededForFreeShipping,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    wishlist,
    toggleWishlist,
    isInWishlist,
    user,
    customerProfile,
    authLoading,
    signInWithGoogle,
    signOutUser,
    updateProfileData,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    quickViewProduct,
    setQuickViewProduct,
    toasts,
    showToast,
    removeToast,
    globalSearch,
    setGlobalSearch,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
