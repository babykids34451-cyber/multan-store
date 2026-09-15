import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Heart,
  Phone,
  Truck,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { businessConfig } from '../config/businessConfig';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct: product,
    setQuickViewProduct,
    addToCart,
    isInWishlist,
    toggleWishlist,
  } = useStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.sizes?.[0]
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product?.colors?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const price = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setQuickViewProduct(null);
    }, 1200);
  };

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum, I want to order "${product.name}" (SKU: ${product.sku}) on Cash on Delivery.\nPrice: Rs. ${price.toLocaleString()}\nSize: ${selectedSize || 'N/A'}\nColor: ${selectedColor || 'N/A'}\nQuantity: ${quantity}`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
          onClick={() => setQuickViewProduct(null)}
        />

        <div className="relative inline-block align-bottom bg-[#FFFDF8] rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-stone-200 animate-scaleIn">
          {/* Close button */}
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-stone-500 hover:text-stone-900 hover:bg-white shadow-xs transition-colors"
            id="close-quickview-btn"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery */}
            <div className="p-6 bg-stone-50 flex flex-col justify-between">
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-white border border-stone-200">
                <img
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {product.images.length > 1 && (
                <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                        selectedImage === idx ? 'border-pink-500' : 'border-stone-200 opacity-70'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info and Actions */}
            <div className="p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 uppercase tracking-wider font-semibold">
                    <span>{product.category}</span>
                    <span className="font-mono text-[11px]">SKU: {product.sku}</span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 mt-1">
                    {product.name}
                  </h3>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-stone-900">
                      Rs. {price.toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-stone-400 line-through">
                        Rs. {product.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>

                {/* Size options */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-stone-800 block mb-1.5">
                      Select Size:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            selectedSize === size
                              ? 'border-pink-600 bg-pink-50 text-pink-700 font-bold'
                              : 'border-stone-200 text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color options */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-stone-800 block mb-1.5">
                      Color: <span className="font-normal text-stone-600">{selectedColor}</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all ${
                            selectedColor === color
                              ? 'border-stone-900 bg-stone-900 text-white font-semibold'
                              : 'border-stone-200 text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs font-bold text-stone-800">Quantity:</span>
                  <div className="flex items-center border border-stone-300 rounded-lg">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-2.5 py-1 text-stone-600 hover:text-stone-900"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-stone-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                      className="px-2.5 py-1 text-stone-600 hover:text-stone-900"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                      product.stock <= 0
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-900 text-white hover:bg-pink-600'
                    }`}
                    id="quickview-add-to-cart-btn"
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        Add to Cart • Rs. {(price * quantity).toLocaleString()}
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 rounded-xl border transition-colors ${
                      inWishlist
                        ? 'border-pink-500 bg-pink-50 text-pink-600'
                        : 'border-stone-300 text-stone-600 hover:text-pink-600 hover:border-pink-400'
                    }`}
                    title="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-pink-500' : ''}`} />
                  </button>
                </div>

                {/* WhatsApp Quick Order */}
                <a
                  href={`https://wa.me/${businessConfig.orderWhatsapp || businessConfig.whatsapp}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  id="quickview-whatsapp-btn"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Order on WhatsApp (Fast COD)
                </a>

                {/* Badges */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-pink-500" />
                    2-4 Days Shipping
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    COD at Doorstep
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
