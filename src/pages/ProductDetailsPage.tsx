import React, { useState } from 'react';
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Phone,
  Check,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { businessConfig } from '../config/businessConfig';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailsPageProps {
  product: Product;
  onNavigate: (view: string, param?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
  onNavigate,
  onSelectProduct,
}) => {
  const {
    addToCart,
    isInWishlist,
    toggleWishlist,
    products,
    setIsCartDrawerOpen,
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes?.[0]
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const price = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    setIsCartDrawerOpen(false);
    onNavigate('checkout');
  };

  const whatsappOrderMessage = encodeURIComponent(
    `Assalam-o-Alaikum, I want to order "${product.name}" on Cash on Delivery.\nSKU: ${product.sku}\nPrice: Rs. ${price.toLocaleString()}\nSize: ${selectedSize || 'Standard'}\nColor: ${selectedColor || 'Standard'}\nQuantity: ${quantity}`
  );

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-stone-500">
        <button onClick={() => onNavigate('home')} className="hover:text-stone-900">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button
          onClick={() => onNavigate('shop', product.category)}
          className="hover:text-stone-900"
        >
          {product.category}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-900 font-semibold truncate max-w-xs sm:max-w-md">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Images */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/90 shadow-xs relative">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-pink-600 text-white text-xs font-bold rounded-full shadow-md">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-pink-600 ring-2 ring-pink-500/20 shadow-sm'
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-semibold uppercase tracking-wider mb-2">
              <span>{product.category}</span>
              <span className="font-mono text-[11px] text-stone-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-stone-900">
                Rs. {price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-lg text-stone-400 line-through">
                  Rs. {product.price.toLocaleString()}
                </span>
              )}
              {product.stock > 0 ? (
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {product.stock < 5 ? `Only ${product.stock} items left in stock` : 'In Stock'}
                </span>
              ) : (
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-stone text-xs sm:text-sm text-stone-600 leading-relaxed">
            <p>{product.description}</p>
          </div>

          {/* Variant: Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-stone-900">Select Size:</span>
                <span className="text-pink-600 font-semibold">{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'border-pink-600 bg-pink-50 text-pink-700 shadow-xs'
                        : 'border-stone-300 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variant: Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-stone-900">Select Color:</span>
                <span className="text-stone-600 font-medium">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                      selectedColor === color
                        ? 'border-stone-900 bg-stone-900 text-white font-bold'
                        : 'border-stone-200 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Add To Cart Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-stone-300 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-stone-600 hover:text-stone-900 font-bold"
                  id="pdp-qty-minus"
                >
                  -
                </button>
                <span className="px-3 text-sm font-bold text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  className="px-3 py-1.5 text-stone-600 hover:text-stone-900 font-bold"
                  id="pdp-qty-plus"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer ${
                  product.stock <= 0
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-900 text-white hover:bg-pink-600'
                }`}
                id="pdp-add-to-cart-btn"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart • Rs. {(price * quantity).toLocaleString()}</span>
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                  inWishlist
                    ? 'border-pink-500 bg-pink-50 text-pink-600'
                    : 'border-stone-300 text-stone-600 hover:text-pink-600 hover:border-pink-400'
                }`}
                title="Wishlist"
                id="pdp-wishlist-toggle"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-pink-500' : ''}`} />
              </button>
            </div>

            {/* Buy Now & WhatsApp Direct */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full py-3 px-4 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                id="pdp-buy-now-btn"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now (Direct Checkout)</span>
              </button>

              <a
                href={`https://wa.me/${businessConfig.orderWhatsapp || businessConfig.whatsapp}?text=${whatsappOrderMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm text-center"
                id="pdp-whatsapp-order-btn"
              >
                <Phone className="w-4 h-4" />
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Delivery & Trust Highlights */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5 text-xs">
            <div className="flex items-center gap-3 text-stone-700">
              <Truck className="w-4 h-4 text-pink-600 shrink-0" />
              <span>
                <strong>Cash on Delivery (COD)</strong> available throughout Pakistan in 2-4 business days.
              </span>
            </div>
            <div className="flex items-center gap-3 text-stone-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Free delivery on any order above <strong>Rs. {businessConfig.deliverySettings.freeDeliveryThreshold.toLocaleString()}</strong>.
              </span>
            </div>
            <div className="flex items-center gap-3 text-stone-700">
              <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>7-Day Easy Exchange</strong> policy for sizes, colors, or defects.
              </span>
            </div>
          </div>

          {/* Technical Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Product Specifications
              </h3>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white text-xs">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="flex py-2.5 px-3">
                    <span className="w-1/3 font-semibold text-stone-500">{key}</span>
                    <span className="w-2/3 text-stone-900 font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-10 border-t border-stone-200 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-pink-600">
              You May Also Like
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1">
              Related in {product.category}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Add-to-Cart & WhatsApp Bottom Bar */}
      <div
        className="lg:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3"
        id="mobile-sticky-action-bar"
      >
        <div className="min-w-0">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</div>
          <div className="text-sm font-black text-slate-900 truncate">
            Rs. {(price * quantity).toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct WhatsApp Order */}
          <a
            href={`https://wa.me/${businessConfig.orderWhatsapp || businessConfig.whatsapp}?text=${whatsappOrderMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer shrink-0"
            title="Order directly on WhatsApp"
            id="mobile-sticky-whatsapp-btn"
          >
            <Phone className="w-4 h-4" />
          </a>

          {/* 1-Tap Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              product.stock <= 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
            id="mobile-sticky-add-to-cart-btn"
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
