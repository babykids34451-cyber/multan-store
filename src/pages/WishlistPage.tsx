import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

interface WishlistPageProps {
  onNavigate: (view: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  onNavigate,
  onSelectProduct,
}) => {
  const { wishlist, products, toggleWishlist, addToCart } = useStore();

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            My Wishlist
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        <button
          onClick={() => onNavigate('shop')}
          className="text-xs font-bold text-stone-700 hover:text-pink-600 flex items-center gap-1 transition-colors"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4 shadow-2xs max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">Your wishlist is empty</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
              Explore our collections of hand-crafted Peshawari chappals, stitched lawn, and leather accessories to save your favorites.
            </p>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-2.5 bg-stone-900 hover:bg-pink-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            id="wishlist-start-shopping-btn"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => {
            const price = product.salePrice ?? product.price;
            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group relative bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer"
              >
                <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-stone-600 hover:text-red-500 hover:bg-white shadow-xs transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="text-xs font-bold text-stone-900 line-clamp-2 mt-0.5 group-hover:text-pink-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div className="text-sm font-extrabold text-stone-900">
                      Rs. {price.toLocaleString()}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, 1);
                      }}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-pink-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                      id={`wishlist-add-cart-${product.id}`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
