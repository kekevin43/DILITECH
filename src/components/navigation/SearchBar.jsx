import React, { useState, useEffect } from 'react';
import { Search, X, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function SearchBar({ className = '' }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      const products = await base44.entities.Product.list();
      const filtered = products
        .filter(p => 
          p.name?.toLowerCase().includes(query.toLowerCase()) ||
          p.brand?.toLowerCase().includes(query.toLowerCase()) ||
          p.category?.toLowerCase().includes(query.toLowerCase()) ||
          p.specs?.processor?.toLowerCase().includes(query.toLowerCase()) ||
          p.specs?.ram?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6);
      setSuggestions(filtered);
      setIsLoading(false);
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(createPageUrl(`ProductCatalog?search=${encodeURIComponent(query.trim())}`));
      setShowSuggestions(false);
      setQuery('');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <Input
          type="text"
          placeholder="Search laptops, desktops, accessories..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-12 pr-10 py-6 rounded-full border-gray-200 focus:border-blue-500 shadow-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Enhanced Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (query.length >= 2 || suggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Searching products...</p>
              </div>
            ) : suggestions.length > 0 ? (
              <>
                <div className="max-h-[32rem] overflow-y-auto">
                  {suggestions.map((product) => {
                    const hasDiscount = product.original_price && product.original_price > product.price;
                    const discountPercent = hasDiscount 
                      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
                      : 0;
                    
                    return (
                      <Link
                        key={product.id}
                        to={createPageUrl(`ProductDetail?id=${product.id}`)}
                        className="flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all border-b border-gray-100 dark:border-gray-700 last:border-0 group"
                      >
                        <div className="relative">
                          <img
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100'}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
                          />
                          {hasDiscount && (
                            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5">
                              -{discountPercent}%
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{product.brand}</p>
                            {product.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">{product.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          {product.specs?.processor && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                              {product.specs.processor} • {product.specs.ram}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            ${product.price.toLocaleString()}
                          </p>
                          {hasDiscount && (
                            <p className="text-sm text-gray-400 dark:text-gray-500 line-through">
                              ${product.original_price.toLocaleString()}
                            </p>
                          )}
                          {product.stock > 0 ? (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">In stock</p>
                          ) : (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">Out of stock</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-3">
                  <button
                    onClick={handleSearch}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors py-2 rounded-lg hover:bg-white dark:hover:bg-gray-800"
                  >
                    See all results for "{query}"
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : query.length >= 2 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">No products found for "{query}"</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Try searching with different keywords</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}