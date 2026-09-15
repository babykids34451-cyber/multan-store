import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Phone,
  Sparkles,
  Flame,
  Star,
  Clock,
  RotateCcw,
  CheckCircle2,
  Tag,
  Percent,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { businessConfig } from '../config/businessConfig';
import { Product } from '../types';

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct }) => {
  const { products, categories, banners, setGlobalSearch } = useStore();

  const [activeTab, setActiveTab] = useState<'featured' | 'new' | 'deals' | 'footwear'>('featured');
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 20 });
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isBannerHovered, setIsBannerHovered] = useState(false);

  // Dynamic active banners from store
  const activeBanners = (banners && banners.length > 0)
    ? (banners.filter((b) => b.isActive).length > 0 ? banners.filter((b) => b.isActive) : banners)
    : [];

  // Auto-play banner slides every 5 seconds (pauses on hover)
  useEffect(() => {
    if (isBannerHovered || activeBanners.length === 0) return;
    const bannerInterval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(bannerInterval);
  }, [isBannerHovered, activeBanners.length]);

  const nextBanner = () => {
    if (activeBanners.length === 0) return;
    setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const prevBanner = () => {
    if (activeBanners.length === 0) return;
    setCurrentBannerIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleBannerAction = (linkType?: string, linkValue?: string) => {
    if (linkType === 'whatsapp') {
      window.open(
        `https://wa.me/${businessConfig.orderWhatsapp || businessConfig.whatsapp}?text=Hello%20${encodeURIComponent(businessConfig.businessName)}%2C%20I%20want%20to%20place%20an%20order`,
        '_blank'
      );
    } else if (linkType === 'category') {
      onNavigate('shop', linkValue || 'all');
    } else if (linkType === 'shop') {
      onNavigate('shop', linkValue || 'all');
    } else if (linkType === 'custom') {
      if (linkValue?.startsWith('http')) {
        window.open(linkValue, '_blank');
      } else {
        onNavigate(linkValue || 'shop');
      }
    } else {
      onNavigate('shop', 'featured');
    }
  };

  // Countdown timer for Flash Deals banner
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter products according to active tab
  const displayedProducts = products.filter((p) => {
    if (activeTab === 'featured') return p.featured;
    if (activeTab === 'new') return p.isNew;
    if (activeTab === 'deals') return p.salePrice && p.salePrice < p.price;
    if (activeTab === 'footwear') return p.category.toLowerCase().includes('footwear') || p.tags.includes('chappal');
    return true;
  }).slice(0, 8);

  const testimonials = [
    {
      name: 'Ayesha Khan',
      city: 'Lahore',
      rating: 5,
      review: 'Charsadda Peshawari chappal ki quality zabardast hai! Pure genuine leather aur fitting bilkul perfect. Cash on Delivery bhi 2 din me pohanch gaya.',
      item: 'Authentic Peshawari Chappal',
    },
    {
      name: 'Hamza Rasheed',
      city: 'Islamabad',
      rating: 5,
      review: 'Raast payment bohot fast thi, 0% fee ke sath JS Bank/Zindigi par transfer ho gaya. Highly recommended store!',
      item: 'Hand-Stitched Leather Wallet',
    },
    {
      name: 'Bilal Malik',
      city: 'Karachi',
      rating: 5,
      review: 'Lawn suit fabric bohot soft aur colors original hain. Parcel opening inspection ke sath mila. Very satisfied!',
      item: 'Embroidered Luxury Kurta',
    },
  ];

  const currentSlide = activeBanners[currentBannerIndex % (activeBanners.length || 1)] || activeBanners[0];

  return (
    <div className="w-full space-y-8 sm:space-y-16 pb-16 sm:pb-20">
      {/* 1. Top Grand Hero Promo Banner Slider */}
      {activeBanners.length > 0 && currentSlide && (
        <section
          className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-1 sm:pt-4"
          onMouseEnter={() => setIsBannerHovered(true)}
          onMouseLeave={() => setIsBannerHovered(false)}
          id="top-promo-banner"
        >
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border border-slate-800 bg-slate-950 min-h-[350px] sm:min-h-[420px] md:min-h-[460px] flex items-center">
            {/* Background image & gradient overlays for each slide */}
            {activeBanners.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === (currentBannerIndex % activeBanners.length) ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                }`}
              >
                <img
                  src={slide.bgImage}
                  alt={slide.headline}
                  className="w-full h-full object-cover object-center scale-105 transition-transform duration-10000"
                />
                {/* Multilayer gradient for optimal text contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40 md:to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30" />
              </div>
            ))}

            {/* Foreground Slide Content */}
            <div className="relative z-20 w-full p-4 sm:p-10 md:p-14 lg:p-16 max-w-3xl space-y-3.5 sm:space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-wide uppercase bg-rose-600 text-white shadow-md">
                  <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  {currentSlide.tag}
                </span>
                {currentSlide.badge && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-white/15 backdrop-blur-md text-slate-200 border border-white/20">
                    {currentSlide.badge}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] drop-shadow-md">
                {currentSlide.headline}
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-slate-200 max-w-xl leading-relaxed">
                {currentSlide.subheadline}
              </p>

              {/* Offer Coupon / Guarantee Pill */}
              {currentSlide.offerCode && (
                <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-[11px] sm:text-xs font-bold text-amber-300">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>{currentSlide.offerCode}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                {currentSlide.primaryBtnText && (
                  <button
                    onClick={() => handleBannerAction(currentSlide.primaryLinkType, currentSlide.primaryLinkValue)}
                    className="px-5 sm:px-8 py-3 sm:py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    id="banner-primary-cta"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{currentSlide.primaryBtnText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {currentSlide.secondaryBtnText && (
                  <button
                    onClick={() => handleBannerAction(currentSlide.secondaryLinkType, currentSlide.secondaryLinkValue)}
                    className="px-4 sm:px-7 py-2.5 sm:py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm rounded-xl backdrop-blur-xs transition-all cursor-pointer text-center"
                    id="banner-secondary-cta"
                  >
                    {currentSlide.secondaryBtnText}
                  </button>
                )}
              </div>

              {/* Quick delivery / COD trust micro strip */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-300 font-medium">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  Doorstep Cash on Delivery (COD)
                </span>
                <span className="hidden sm:flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  7-Day Replacement Guarantee
                </span>
                <span className="hidden md:flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  0% Raast Fees
                </span>
              </div>
            </div>

            {/* Carousel Left & Right Arrow Controls */}
            {activeBanners.length > 1 && (
              <>
                <button
                  onClick={prevBanner}
                  aria-label="Previous Slide"
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-white border border-white/20 backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-lg"
                  id="banner-prev-btn"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  onClick={nextBanner}
                  aria-label="Next Slide"
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-white border border-white/20 backdrop-blur-md transition-all hover:scale-110 cursor-pointer shadow-lg"
                  id="banner-next-btn"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            )}

            {/* Dots Indicator & Slide Counter */}
            {activeBanners.length > 1 && (
              <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-10 z-30 flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                {activeBanners.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentBannerIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      idx === (currentBannerIndex % activeBanners.length)
                        ? 'w-6 h-2 bg-rose-500'
                        : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                    }`}
                    id={`banner-dot-${idx}`}
                  />
                ))}
                <span className="text-[10px] font-mono font-bold text-slate-300 ml-1">
                  0{(currentBannerIndex % activeBanners.length) + 1} / 0{activeBanners.length}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. Visual Category Circles (Shop by Category Bar) */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-3 sm:mb-4">
          <h2 className="text-xs sm:text-base font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-rose-600" />
            Shop Top Categories
          </h2>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('shop', cat.slug)}
              className="flex flex-col items-center gap-1.5 sm:gap-2 shrink-0 group cursor-pointer"
              id={`cat-circle-${cat.id}`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 border-2 border-slate-200 group-hover:border-rose-600 group-hover:scale-105 transition-all duration-300 shadow-xs overflow-hidden bg-slate-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:rotate-1 transition-transform"
                />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-rose-600 transition-colors text-center max-w-[75px] sm:max-w-[85px] truncate">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. High-Converting E-Commerce Hero Banner */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white shadow-xl sm:shadow-2xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center p-5 sm:p-12 lg:p-14">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] sm:text-xs font-bold">
                <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-rose-400" />
                <span>New Season 2026 Collection • Cash on Delivery</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
                Pakistan's Finest <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-300">
                  Fashion & Artisanal Craft
                </span>
              </h2>

              <p className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-xl leading-relaxed">
                Handcrafted Charsadda Peshawari chappals, designer unstitched lawn, luxury kurtas, and full-grain leather wallets. Delivered with trust right to your doorstep.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                <button
                  onClick={() => onNavigate('shop')}
                  className="px-6 sm:px-7 py-3 sm:py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  id="hero-shop-now-btn"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('shop', 'featured')}
                  className="px-6 sm:px-7 py-2.5 sm:py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm rounded-xl backdrop-blur-xs transition-all cursor-pointer text-center"
                  id="hero-explore-products-btn"
                >
                  🔥 Best Sellers
                </button>
              </div>

              {/* E-Commerce Guarantee Strip */}
              <div className="pt-4 sm:pt-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 border-t border-slate-800 text-left">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center sm:block gap-3">
                  <div className="text-sm sm:text-lg font-black text-emerald-400">COD Available</div>
                  <div className="text-[11px] text-slate-400">Pay cash at doorstep</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center sm:block gap-3">
                  <div className="text-sm sm:text-lg font-black text-rose-400">Rs. 0 Shipping</div>
                  <div className="text-[11px] text-slate-400">On orders &gt; Rs. 3,000</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center sm:block gap-3">
                  <div className="text-sm sm:text-lg font-black text-amber-400">7-Day Easy</div>
                  <div className="text-[11px] text-slate-400">Size & product exchange</div>
                </div>
              </div>
            </div>

            {/* Right Hero Product Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
                <div className="relative aspect-4/3 w-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80"
                    alt="Authentic Pakistani Footwear"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-rose-600 text-white px-2.5 py-1 rounded-md text-xs font-black shadow-xs">
                    BEST SELLER
                  </span>
                </div>
                <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Handcrafted In Pakistan
                    </span>
                    <h3 className="text-sm font-bold mt-0.5">Authentic Peshawari Chappal</h3>
                    <p className="text-xs text-slate-400">Charsadda Genuine Leather</p>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-white">Rs. 2,899</div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      COD Ready
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Flash Deals Countdown Banner */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-slate-900 text-white p-4 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-lg">
          <div className="flex items-center gap-3 sm:gap-4 text-left">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-rose-200">
                Limited Time Promotion
              </span>
              <h3 className="text-lg sm:text-2xl font-black">Deal of the Day — Flat Discounts</h3>
              <p className="text-[11px] sm:text-xs text-rose-100 mt-0.5">
                Special bundle savings with 0% payment fees via SBP Raast or Cash on Delivery.
              </p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="bg-slate-950/80 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-center border border-white/10 min-w-[48px] sm:min-w-[55px]">
              <span className="block text-lg sm:text-xl font-black font-mono leading-none text-white">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400">Hours</span>
            </div>
            <span className="font-bold text-lg sm:text-xl text-rose-300">:</span>
            <div className="bg-slate-950/80 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-center border border-white/10 min-w-[48px] sm:min-w-[55px]">
              <span className="block text-lg sm:text-xl font-black font-mono leading-none text-white">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400">Mins</span>
            </div>
            <span className="font-bold text-lg sm:text-xl text-rose-300">:</span>
            <div className="bg-slate-950/80 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-center border border-white/10 min-w-[48px] sm:min-w-[55px]">
              <span className="block text-lg sm:text-xl font-black font-mono leading-none text-rose-400">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400">Secs</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Product Tabs (The Heart of E-Commerce) */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 border-b border-slate-200 pb-3 sm:pb-4">
          <div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-rose-600">
              Verified Collection
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              Featured Products
            </h2>
          </div>

          {/* Collection Tab Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'featured', label: '🔥 Best Sellers' },
              { id: 'new', label: '✨ New Arrivals' },
              { id: 'deals', label: '🏷️ On Sale' },
              { id: 'footwear', label: '👞 Footwear' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                id={`tab-btn-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {displayedProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-10">
          <button
            onClick={() => onNavigate('shop')}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
            id="browse-full-catalog-btn"
          >
            <span>Explore All {products.length} Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 6. E-Commerce 4-Pillar Trust Grid */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Cash on Delivery</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Available nationwide across Karachi, Lahore, Islamabad & 250+ cities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">7-Day Easy Exchange</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Hassle-free size replacement with fast courier pickup support.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">100% Genuine Quality</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Rigorous quality check before packaging. What you see is what you get.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Direct WhatsApp Help</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Instant human customer support on WhatsApp: {businessConfig.helplineWhatsappDisplay || businessConfig.whatsappDisplay}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Verified Pakistani Customer Reviews */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-rose-600">
            Real Experiences
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Loved By Shoppers Across Pakistan
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-2 text-amber-500 font-bold text-xs sm:text-sm">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-slate-700">4.9/5 Average Rating from 12,000+ Orders</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{t.review}"
                </p>
              </div>

              <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                  <p className="text-[10px] text-slate-400">{t.city}, Pakistan</p>
                </div>
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                  {t.item}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Promotional Voucher Banner */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-5 sm:p-12 text-center relative overflow-hidden border border-slate-800">
          <div className="relative z-10 max-w-xl mx-auto space-y-3 sm:space-y-4">
            <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
              Exclusive Welcome Offer
            </span>
            <h3 className="text-xl sm:text-3xl font-black">
              Get Flat 10% Off On Your Order
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Use coupon voucher code <span className="font-mono font-black text-amber-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">SHAAN10</span> at checkout to claim instant discount.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('shop')}
                className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
                id="claim-voucher-btn"
              >
                Shop Now With Discount
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
