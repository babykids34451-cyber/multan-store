import React from 'react';
import { Home, LayoutGrid, Package, Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
}) => {
  const { cartCount, wishlist, setIsCartDrawerOpen } = useStore();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => onNavigate('home'),
      isActive: currentView === 'home',
      badge: 0,
    },
    {
      id: 'shop',
      label: 'Categories',
      icon: LayoutGrid,
      action: () => onNavigate('shop'),
      isActive: currentView === 'shop',
      badge: 0,
    },
    {
      id: 'track',
      label: 'Track Order',
      icon: Package,
      action: () => onNavigate('track-order'),
      isActive: currentView === 'track-order',
      badge: 0,
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      action: () => onNavigate('wishlist'),
      isActive: currentView === 'wishlist',
      badge: wishlist.length,
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingBag,
      action: () => setIsCartDrawerOpen(true),
      isActive: false,
      badge: cartCount,
      highlight: true,
    },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] transition-all"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      id="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 cursor-pointer select-none ${
                active ? 'text-rose-600 font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
              id={`mobile-tab-${item.id}`}
            >
              {/* Active top pill indicator */}
              {active && (
                <span className="absolute top-0 w-8 h-1 bg-rose-600 rounded-b-full shadow-xs" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    active ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.8px]'
                  }`}
                />

                {/* Badge (for Cart or Wishlist) */}
                {item.badge > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 rounded-full text-[10px] font-black flex items-center justify-center text-white leading-none shadow-xs ${
                      item.highlight ? 'bg-rose-600' : 'bg-slate-900'
                    }`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] tracking-tight leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
