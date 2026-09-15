import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  Phone,
  Truck,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Package,
  Flame,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { businessConfig } from '../config/businessConfig';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const {
    cartCount,
    subtotal,
    wishlist,
    user,
    signInWithGoogle,
    signOutUser,
    setIsCartDrawerOpen,
    globalSearch,
    setGlobalSearch,
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(globalSearch);
  const [, setSettingsTick] = useState(0);

  // Sync when admin updates business branding / logo
  useEffect(() => {
    const handleSettingsUpdated = () => {
      setSettingsTick((prev) => prev + 1);
    };
    window.addEventListener('shaan_settings_updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('shaan_settings_updated', handleSettingsUpdated);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalSearch(searchInput);
    onNavigate('shop');
  };

  const handleSearchTagClick = (tag: string) => {
    setSearchInput(tag);
    setGlobalSearch(tag);
    onNavigate('shop');
  };

  const navLinks = [
    { label: 'Shop All', view: 'shop', icon: null },
    { label: 'Footwear', view: 'shop', param: 'footwear', badge: null },
    { label: 'Apparel & Kurtas', view: 'shop', param: 'apparel', badge: null },
    { label: 'Leather & Bags', view: 'shop', param: 'leather-goods', badge: null },
    { label: 'New Arrivals', view: 'shop', param: 'new', badge: 'NEW' },
    { label: 'Flash Sale', view: 'shop', param: 'featured', isSale: true },
    { label: 'Track Parcel', view: 'track-order', icon: Package },
    { label: 'Contact', view: 'contact', icon: null },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      {/* Main Header Container */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation Menu"
              id="mobile-menu-toggle-btn"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo & Brand Identity */}
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-left group flex items-center gap-2 sm:gap-3 cursor-pointer"
              id="header-brand-logo-btn"
            >
              {businessConfig.logoUrl ? (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shadow-xs p-1">
                  <img
                    src={businessConfig.logoUrl}
                    alt={businessConfig.businessName}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold shadow-md group-hover:bg-rose-600 transition-colors">
                  <span className="text-base sm:text-xl tracking-tight">
                    {businessConfig.logoIconText || 'ش'}
                  </span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="block text-lg sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors">
                    {businessConfig.shortName || businessConfig.businessName}
                    <span className="text-rose-600">.</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider hidden sm:inline-block">
                    Verified Store
                  </span>
                </div>
                <span className="block text-[8px] sm:text-[10px] tracking-wider sm:tracking-widest font-bold uppercase text-slate-500 -mt-0.5">
                  Pakistan • COD Available
                </span>
              </div>
            </button>
          </div>

          {/* Prominent E-Commerce Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-6 flex-col">
            <form onSubmit={handleSearchSubmit} className="relative w-full" id="desktop-search-form">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search Peshawari chappals, kurtas, lawn suits, leather wallets..."
                className="w-full pl-11 pr-24 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:bg-white transition-all shadow-2xs"
                id="header-search-input"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                id="header-search-submit-btn"
              >
                Search
              </button>
            </form>
            {/* Quick Trending Keyword Pills */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 pl-1">
              <span className="font-semibold text-slate-500 flex items-center gap-0.5">
                <Flame className="w-3 h-3 text-rose-500" /> Trending:
              </span>
              {['Chappal', 'Lawn Suit', 'Leather Wallet', 'Kurta'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleSearchTagClick(item)}
                  className="text-slate-600 hover:text-rose-600 hover:underline cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Track Order Quick Icon (Desktop) */}
            <button
              onClick={() => onNavigate('track-order')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-semibold cursor-pointer border border-transparent hover:border-slate-200"
              id="header-track-btn"
            >
              <Package className="w-4 h-4 text-slate-600" />
              <span>Track</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-2.5 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80"
              title="Wishlist"
              id="header-wishlist-button"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-rose-600 transition-colors shadow-sm cursor-pointer"
              title="Shopping Cart"
              id="header-cart-button"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none pl-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-300">Cart</span>
                <span className="text-xs font-extrabold text-white">
                  {subtotal > 0 ? `Rs. ${subtotal.toLocaleString()}` : 'Rs. 0'}
                </span>
              </div>
            </button>

            {/* User Account / Auth Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50 transition-colors cursor-pointer"
                    id="user-profile-menu-button"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Account'}
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="hidden md:inline-block text-xs font-bold max-w-[90px] truncate text-slate-800">
                      {user.displayName?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:inline-block" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {user.displayName || user.email}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('account');
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                        id="user-menu-account-btn"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        My Profile & Addresses
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('orders');
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                        id="user-menu-orders-btn"
                      >
                        <Package className="w-4 h-4 text-slate-500" />
                        My Orders
                      </button>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOutUser();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer"
                        id="user-menu-logout-btn"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:border-slate-900 text-slate-800 text-xs font-bold transition-all cursor-pointer bg-slate-50 hover:bg-white shadow-2xs"
                  title="Sign In with Google"
                  id="header-login-btn"
                >
                  <UserIcon className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline-block">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar & Quick Tags */}
        <div className="lg:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full" id="mobile-search-form">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search chappals, kurtas, leather, lawn..."
              className="w-full pl-10 pr-20 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
              id="mobile-search-input"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-rose-600 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
              id="mobile-search-btn"
            >
              Search
            </button>
          </form>

          {/* Mobile Quick Search Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">Popular:</span>
            {['Peshawari Chappal', 'Kurta', 'Leather Wallet', 'Lawn', 'Handbag'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSearchTagClick(tag)}
                className="text-[10px] font-medium bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 px-2 py-0.5 rounded-md shrink-0 transition-colors border border-slate-200"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop E-Commerce Category Navigation Strip */}
        <nav className="hidden lg:flex items-center space-x-1 border-t border-slate-200 py-1.5">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => onNavigate(link.view, link.param)}
              className={`text-xs font-bold tracking-tight px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                link.isSale
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  : currentView === link.view && (!link.param || globalSearch === '')
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
              id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {link.isSale && <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-500" />}
              {link.badge && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-rose-600 text-white">
                  {link.badge}
                </span>
              )}
              <span>{link.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Side Slide-Over Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-y-auto">
            <div className="p-5 space-y-6">
              {/* Drawer Top Branding */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  {businessConfig.logoUrl ? (
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shadow-xs shrink-0 p-1">
                      <img
                        src={businessConfig.logoUrl}
                        alt={businessConfig.businessName}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white font-black flex items-center justify-center shadow-md shadow-rose-600/20 shrink-0">
                      {businessConfig.logoIconText || 'S'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      {businessConfig.businessName}
                    </h3>
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Pakistan Delivery
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  id="close-mobile-drawer-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 pb-1">
                  Catalog & Collections
                </p>
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate(link.view, link.param);
                    }}
                    className="flex items-center justify-between w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    id={`mobile-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-center gap-2.5">
                      {link.isSale ? (
                        <Flame className="w-4 h-4 text-rose-600" />
                      ) : (
                        <Tag className="w-4 h-4 text-slate-400" />
                      )}
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="px-2 py-0.5 text-[9px] font-extrabold bg-rose-600 text-white rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Quick Customer Service Links */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 pb-1">
                  Assistance & Tracking
                </p>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('track-order');
                  }}
                  className="flex items-center gap-2.5 w-full text-left py-2 px-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Package className="w-4 h-4 text-amber-500" />
                  <span>Track Your Order</span>
                </button>
                <a
                  href={`https://wa.me/${businessConfig.helplineWhatsapp || businessConfig.whatsapp}?text=${encodeURIComponent('Assalam-o-Alaikum, I need assistance with an order on Shaan Store.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 w-full text-left py-2 px-3 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Helpline: {businessConfig.helplineWhatsappDisplay || businessConfig.whatsappDisplay}</span>
                </a>
                <a
                  href={`https://wa.me/${businessConfig.orderWhatsapp || businessConfig.whatsapp}?text=${encodeURIComponent('Assalam-o-Alaikum, I want to place a quick order on Shaan Store.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 w-full text-left py-2 px-3 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <Phone className="w-4 h-4 text-rose-600" />
                  <span>Order on WhatsApp: {businessConfig.orderWhatsappDisplay || businessConfig.whatsappDisplay}</span>
                </a>
              </div>
            </div>

            {/* User Account / Sign In at bottom of drawer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 px-2">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user.displayName || 'Customer Account'}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onNavigate('account');
                      }}
                      className="flex-1 py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 text-center cursor-pointer"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOutUser();
                      }}
                      className="py-1.5 px-3 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 flex items-center justify-center cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signInWithGoogle();
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                  id="mobile-drawer-google-signin-btn"
                >
                  <UserIcon className="w-4 h-4" />
                  Sign In with Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
