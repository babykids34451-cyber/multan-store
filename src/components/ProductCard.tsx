import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Check, Star, Truck } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onOpenQuickView?: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenQuickView,
  onSelectProduct,
}) => {
  const { addToCart, isInWishlist, toggleWishlist, setQuickViewProduct } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [isAdded, setIsAdded] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)
    : 0;

  // Derive stable pseudo rating based on product ID for e-commerce social proof
  const rating = product.featured ? 4.9 : 4.8;
  const reviewCount = ((product.id.charCodeAt(0) * 7) % 25) + 12;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenQuickView) {
      onOpenQuickView(product);
    } else {
      setQuickViewProduct(product);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => onSelectProduct?.(product)}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-lg hover:border-slate-400/80 transition-all duration-300 cursor-pointer"
      id={`product-card-${product.id}`}
    >
      {/* Top Badges & Wishlist */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1 pointer-events-auto">
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black tracking-tight bg-rose-600 text-white shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isNew && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black tracking-tight bg-slate-900 text-white shadow-xs">
              NEW
            </span>
          )}
        </div>

        <button
          onClick={handleWishlistToggle}
          className={`pointer-events-auto p-2 rounded-full transition-all duration-200 cursor-pointer shadow-xs ${
            inWishlist
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              : 'bg-white/90 backdrop-blur-xs text-slate-600 hover:text-rose-600 hover:bg-white'
          }`}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          id={`wishlist-btn-${product.id}`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>
      </div>

      {/* Image Gallery Container */}
      <div
        className="relative aspect-square w-full bg-slate-100 overflow-hidden"
        onMouseEnter={() => {
          if (product.images.length > 1) setCurrentImageIndex(1);
        }}
        onMouseLeave={() => setCurrentImageIndex(0)}
      >
        <img
          src={product.images[currentImageIndex] || product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Quick View Hover Button */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex items-center gap-2">
          <button
            onClick={handleQuickView}
            className="flex-1 py-2 px-3 bg-white/95 backdrop-blur-xs hover:bg-white text-slate-900 text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
            id={`quickview-btn-${product.id}`}
          >
            <Eye className="w-3.5 h-3.5 text-slate-700" />
            Quick View
          </button>
        </div>
      </div>

      {/* Product Details Content */}
      <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between">
        <div>
          {/* Category & Stock Status */}
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              {product.category}
            </span>
            {product.stock > 0 ? (
              product.stock < 5 ? (
                <span className="text-amber-600 font-bold text-[10px]">Only {product.stock} left</span>
              ) : (
                <span className="text-emerald-600 font-bold text-[10px]">In Stock</span>
              )
            ) : (
              <span className="text-red-500 font-bold text-[10px]">Sold Out</span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-rose-600 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Social Proof Star Rating & COD Badge */}
          <div className="flex items-center justify-between mt-1.5 gap-2">
            <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
              <span className="text-slate-400 font-normal">({reviewCount})</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
              <Truck className="w-2.5 h-2.5" /> COD
            </span>
          </div>
        </div>

        {/* Size chips if present */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-2.5 flex items-center gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
            <span className="text-[10px] text-slate-400 font-medium">Size:</span>
            {product.sizes.slice(0, 4).map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded border transition-colors ${
                  selectedSize === size
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* Price & Add to Cart Footer */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Rs. {(product.salePrice ?? product.price).toLocaleString()}
            </div>
            {hasDiscount && (
              <div className="text-[11px] text-slate-400 line-through">
                Rs. {product.price.toLocaleString()}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer ${
              product.stock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-white hover:bg-rose-600 active:scale-95'
            }`}
            id={`add-to-cart-btn-${product.id}`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
