import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { businessConfig } from '../config/businessConfig';

interface CartDrawerProps {
  onNavigateToCheckout: () => void;
  onNavigateToShop: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNavigateToCheckout,
  onNavigateToShop,
}) => {
  const {
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
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    const res = await applyCoupon(couponInput);
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FFFDF8] shadow-2xl flex flex-col border-l border-stone-200 animate-slideInRight">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pink-600" />
              <h2 className="text-base font-bold text-stone-900">
                Shopping Cart ({cartCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              id="close-cart-drawer-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="bg-stone-100/80 px-4 py-3 border-b border-stone-200">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-800 mb-1.5">
              <span className="flex items-center gap-1.5 text-stone-700">
                <Truck className="w-3.5 h-3.5 text-pink-500" />
                {amountNeededForFreeShipping > 0 ? (
                  <span>
                    Add <strong className="text-pink-600">Rs. {amountNeededForFreeShipping.toLocaleString()}</strong> more for FREE Shipping!
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    You unlocked FREE Delivery across Pakistan!
                  </span>
                )}
              </span>
              <span className="text-[11px] text-stone-500">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  freeShippingProgress >= 100 ? 'bg-emerald-500' : 'bg-pink-500'
                }`}
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Your cart is empty</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Looks like you haven't added any authentic Pakistani fashion or lifestyle products yet.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    onNavigateToShop();
                  }}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-pink-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  id="empty-cart-shop-btn"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item, idx) => {
                const price = item.product.salePrice ?? item.product.price;
                return (
                  <div
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                    className="flex gap-3.5 p-3 rounded-xl bg-white border border-stone-200 shadow-2xs"
                  >
                    {/* Item Image */}
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-18 h-18 object-cover rounded-lg bg-stone-100 shrink-0"
                    />

                    {/* Item Info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() =>
                              removeFromCart(item.product.id, item.selectedSize, item.selectedColor)
                            }
                            className="text-stone-400 hover:text-red-500 transition-colors p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-lg hover:bg-stone-100"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Variants */}
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500 font-medium">
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                          {item.selectedColor && (
                            <span>• {item.selectedColor}</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity & Item Subtotal */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.selectedSize,
                                item.selectedColor
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 active:bg-stone-200 rounded-l-lg"
                            id={`cart-decrease-${item.product.id}`}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-stone-800 select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.selectedSize,
                                item.selectedColor
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 active:bg-stone-200 rounded-r-lg"
                            id={`cart-increase-${item.product.id}`}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-stone-900">
                            Rs. {(price * item.quantity).toLocaleString()}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[10px] text-stone-400">
                              Rs. {price.toLocaleString()} each
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-white space-y-3.5">
              {/* Coupon Box */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Coupon "{appliedCoupon.code}" Applied (-Rs. {discount.toLocaleString()})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-500 hover:text-red-700 font-bold text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Coupon Code (e.g. WELCOME10)"
                        className="w-full pl-8 pr-3 py-2 text-xs border border-stone-300 rounded-lg uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-pink-500"
                        id="cart-coupon-input"
                      />
                      <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs font-bold rounded-lg transition-colors"
                      id="apply-coupon-btn"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 pt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      {couponError}
                    </p>
                  )}
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs pt-1 border-t border-stone-100">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">Rs. {subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-stone-900">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `Rs. ${shipping.toLocaleString()}`
                    )}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Voucher Discount</span>
                    <span>-Rs. {discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Estimated Total</span>
                  <span className="text-base text-pink-600">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout CTA Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    onNavigateToCheckout();
                  }}
                  className="w-full py-3.5 bg-stone-900 hover:bg-pink-600 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                  id="cart-proceed-checkout-btn"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    onNavigateToShop();
                  }}
                  className="w-full py-2 text-stone-600 hover:text-stone-900 text-xs font-semibold text-center transition-colors cursor-pointer"
                  id="cart-continue-shopping-btn"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
