import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import CategoryNav from '../components/navigation/CategoryNav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ProductCatalog() {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  const searchParam = urlParams.get('search');

  const [user, setUser] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [filters, setFilters] = useState({
    brands: [],
    ram: [],
    storage: [],
    processor: [],
    minPrice: 0,
    maxPrice: 5000,
    minRating: 0,
    inStockOnly: false
  });
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState(searchParam || '');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date', 200),
    initialData: [],
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist', user?.email],
    queryFn: () => user ? base44.entities.WishlistItem.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  useEffect(() => {
    setWishlistIds(wishlist.map(w => w.product_id));
  }, [wishlist]);

  // Extract available filter options
  const availableFilters = useMemo(() => {
    const brands = new Set();
    const ram = new Set();
    const storage = new Set();
    const processor = new Set();

    products.forEach(p => {
      if (p.brand) brands.add(p.brand);
      if (p.specs?.ram) ram.add(p.specs.ram);
      if (p.specs?.storage) storage.add(p.specs.storage);
      if (p.specs?.processor) processor.add(p.specs.processor);
    });

    return {
      brands: Array.from(brands).sort(),
      ram: Array.from(ram).sort(),
      storage: Array.from(storage).sort(),
      processor: Array.from(processor).sort()
    };
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.specs?.processor?.toLowerCase().includes(query) ||
        p.specs?.ram?.toLowerCase().includes(query) ||
        p.specs?.storage?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryParam) {
      filtered = filtered.filter(p => p.category === categoryParam);
    }

    // Brand filter
    if (filters.brands?.length > 0) {
      filtered = filtered.filter(p => filters.brands.includes(p.brand));
    }

    // RAM filter
    if (filters.ram?.length > 0) {
      filtered = filtered.filter(p => filters.ram.includes(p.specs?.ram));
    }

    // Storage filter
    if (filters.storage?.length > 0) {
      filtered = filtered.filter(p => filters.storage.includes(p.specs?.storage));
    }

    // Processor filter
    if (filters.processor?.length > 0) {
      filtered = filtered.filter(p => filters.processor.includes(p.specs?.processor));
    }

    // Price range
    filtered = filtered.filter(
      p => p.price >= filters.minPrice && p.price <= filters.maxPrice
    );

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(p => (p.rating || 0) >= filters.minRating);
    }

    // In stock only
    if (filters.inStockOnly) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'relevance':
        // Keep original order for search relevance
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
    }

    return filtered;
  }, [products, categoryParam, filters, sortBy, searchQuery]);

  const handleAddToCart = async (product) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    const existingItem = await base44.entities.CartItem.filter({
      user_email: user.email,
      product_id: product.id
    });

    if (existingItem.length > 0) {
      await base44.entities.CartItem.update(existingItem[0].id, {
        quantity: existingItem[0].quantity + 1
      });
    } else {
      await base44.entities.CartItem.create({
        user_email: user.email,
        product_id: product.id,
        quantity: 1,
        product_snapshot: {
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          stock: product.stock
        }
      });
    }
    toast.success('Added to cart!');
  };

  const handleToggleWishlist = async (product) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    const existing = wishlist.find(w => w.product_id === product.id);
    if (existing) {
      await base44.entities.WishlistItem.delete(existing.id);
      setWishlistIds(prev => prev.filter(id => id !== product.id));
      toast.success('Removed from wishlist');
    } else {
      await base44.entities.WishlistItem.create({
        user_email: user.email,
        product_id: product.id
      });
      setWishlistIds(prev => [...prev, product.id]);
      toast.success('Added to wishlist');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      brands: [],
      ram: [],
      storage: [],
      processor: [],
      minPrice: 0,
      maxPrice: 5000,
      minRating: 0,
      inStockOnly: false
    });
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.brands.length > 0) count += filters.brands.length;
    if (filters.ram.length > 0) count += filters.ram.length;
    if (filters.storage.length > 0) count += filters.storage.length;
    if (filters.processor.length > 0) count += filters.processor.length;
    if (filters.minPrice > 0 || filters.maxPrice < 5000) count++;
    if (filters.minRating > 0) count++;
    if (filters.inStockOnly) count++;
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Navigation */}
        <CategoryNav activeCategory={categoryParam} />

        {/* Search Results Header */}
        {searchQuery && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mt-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Search results for "{searchQuery}"
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  window.history.pushState({}, '', createPageUrl('ProductCatalog'));
                }}
                className="rounded-xl dark:bg-gray-700 dark:border-gray-600"
              >
                Clear search
              </Button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8 mb-6">
          <div>
            {!searchQuery && (
              <>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {categoryParam 
                    ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1) + 's'
                    : 'All Products'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                  {activeFilterCount > 0 && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                      • {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
                    </span>
                  )}
                </p>
              </>
            )}
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-52 rounded-xl dark:bg-gray-800 dark:border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              {searchQuery && <SelectItem value="relevance">Most Relevant</SelectItem>}
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
              availableFilters={availableFilters}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isInWishlist={wishlistIds.includes(product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-500 dark:text-gray-400">No products match your filters</p>
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="mt-4 dark:bg-gray-800 dark:border-gray-700"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}