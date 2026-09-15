import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

interface ShopPageProps {
  initialFilterParam?: string;
  onSelectProduct: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialFilterParam,
  onSelectProduct,
}) => {
  const { products, categories, globalSearch, setGlobalSearch } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState(globalSearch);
  const [selectedSort, setSelectedSort] = useState<string>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceMax, setPriceMax] = useState<number>(10000);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync global search or category param
  useEffect(() => {
    if (globalSearch) {
      setSearchQuery(globalSearch);
    }
  }, [globalSearch]);

  useEffect(() => {
    if (initialFilterParam) {
      if (initialFilterParam === 'new') {
        setSelectedSort('newest');
      } else if (initialFilterParam === 'featured') {
        setSelectedSort('featured');
      } else {
        // Assume category slug
        const matched = categories.find((c) => c.slug === initialFilterParam);
        if (matched) {
          setSelectedCategory(matched.name);
        }
      }
    }
  }, [initialFilterParam, categories]);

  // Extract all unique sizes across catalog
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.sizes?.forEach((s) => set.add(s));
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category filter
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
          return false;
        }

        // Search query filter (matches name, description, tags, sku, category)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(q);
          const matchDesc = product.description.toLowerCase().includes(q);
          const matchSku = product.sku.toLowerCase().includes(q);
          const matchCat = product.category.toLowerCase().includes(q);
          const matchTags = product.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchSku && !matchCat && !matchTags) {
            return false;
          }
        }

        // Price filter
        const price = product.salePrice ?? product.price;
        if (price > priceMax) {
          return false;
        }

        // In Stock filter
        if (inStockOnly && product.stock <= 0) {
          return false;
        }

        // Size filter
        if (selectedSize !== 'all' && (!product.sizes || !product.sizes.includes(selectedSize))) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice ?? a.price;
        const priceB = b.salePrice ?? b.price;

        if (selectedSort === 'price-low') {
          return priceA - priceB;
        }
        if (selectedSort === 'price-high') {
          return priceB - priceA;
        }
        if (selectedSort === 'newest') {
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        }
        if (selectedSort === 'discount') {
          const discountA = a.salePrice ? (a.price - a.salePrice) / a.price : 0;
          const discountB = b.salePrice ? (b.price - b.salePrice) / b.price : 0;
          return discountB - discountA;
        }
        // default: featured
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, priceMax, inStockOnly, selectedSize, selectedSort]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setGlobalSearch('');
    setSelectedSort('featured');
    setInStockOnly(false);
    setPriceMax(10000);
    setSelectedSize('all');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    inStockOnly ||
    priceMax < 10000 ||
    selectedSize !== 'all';

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Breadcrumbs & Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>Home</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">Shop Catalog</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {selectedCategory === 'all' ? 'All Products' : selectedCategory}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredProducts.length}</span> of {products.length} products available for nationwide COD
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 shadow-xs cursor-pointer"
              id="mobile-open-filters-btn"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-rose-600" />
              )}
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 hidden sm:inline font-bold">Sort By:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer shadow-xs"
                id="shop-sort-select"
              >
                <option value="featured">Featured / Recommended</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Category Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'
            }`}
          >
            All ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === c.name
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-5 rounded-2xl border border-slate-200/90 h-fit shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-rose-600" />
              Filter Products
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                id="reset-filters-btn"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Search inside shop */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setGlobalSearch(e.target.value);
                }}
                placeholder="Keywords, fabric, SKU..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                id="sidebar-search-input"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">Category</label>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex justify-between items-center cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-rose-50 text-rose-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
                <span className="text-[11px] opacity-75">{products.length}</span>
              </button>

              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat.name).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex justify-between items-center cursor-pointer ${
                      selectedCategory === cat.name
                        ? 'bg-rose-50 text-rose-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Max Price Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-800">Max Price</label>
              <span className="font-black text-rose-600">Rs. {priceMax.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={1000}
              max={10000}
              step={250}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
              id="price-range-slider"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Rs. 1,000</span>
              <span>Rs. 10,000</span>
            </div>
          </div>

          {/* Size Filter */}
          {availableSizes.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block">Filter by Size</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSize('all')}
                  className={`px-2 py-1 text-[11px] font-bold rounded border transition-colors cursor-pointer ${
                    selectedSize === 'all'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  All
                </button>
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-2 py-1 text-[11px] font-bold rounded border transition-colors cursor-pointer ${
                      selectedSize === size
                        ? 'border-rose-600 bg-rose-50 text-rose-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* In Stock Checkbox */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer"
                id="in-stock-only-checkbox"
              />
              <span className="font-bold">In Stock Items Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">No products found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  We couldn't find anything matching your current filters. Try relaxing your search terms or price limits.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2 bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-5 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">Filters</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Category */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-2">Category</label>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg cursor-pointer ${
                      selectedCategory === 'all' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.name)}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg cursor-pointer ${
                        selectedCategory === c.name ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Price */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Max Price</span>
                  <span className="text-rose-600">Rs. {priceMax.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={10000}
                  step={250}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>

              {/* Mobile In Stock */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                />
                In Stock Items Only
              </label>
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-rose-600 transition-colors"
              >
                Apply Filters ({filteredProducts.length} items)
              </button>
              <button
                onClick={() => {
                  handleResetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full py-2 text-slate-500 text-xs font-semibold cursor-pointer"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
