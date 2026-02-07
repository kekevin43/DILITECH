import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

export default function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist }) {
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <Link to={createPageUrl(`ProductDetail?id=${product.id}`)}>
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
          {/* Image Container */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            <img
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.featured && (
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
                  Featured
                </Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-red-500 text-white border-0">
                  -{discountPercent}%
                </Badge>
              )}
              {product.stock < 10 && product.stock > 0 && (
                <Badge variant="outline" className="bg-white/95 text-orange-600 border-orange-200">
                  Only {product.stock} left
                </Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="outline" className="bg-white/95 text-red-600 border-red-200">
                  Out of stock
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleWishlist?.(product);
              }}
              className={cn(
                "absolute top-3 right-3 p-2 rounded-full transition-all duration-300",
                "hover:scale-110 active:scale-95",
                isInWishlist 
                  ? "bg-red-500 text-white" 
                  : "bg-white/95 text-gray-600 hover:text-red-500"
              )}
            >
              <Heart className={cn("w-5 h-5", isInWishlist && "fill-current")} />
            </button>
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-3">
            {/* Brand */}
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {product.brand}
            </p>

            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug min-h-[2.5rem]">
              {product.name}
            </h3>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({product.reviews_count || 0})
                </span>
              </div>
            )}

            {/* Key Specs */}
            {product.specs && (
              <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                {product.specs.processor && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    {product.specs.processor}
                  </span>
                )}
                {product.specs.ram && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                    {product.specs.ram}
                  </span>
                )}
              </div>
            )}

            {/* Price and Action */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ${product.price.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                      ${product.original_price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.(product);
              }}
              disabled={product.stock === 0}
              className={cn(
                "w-full rounded-xl font-medium transition-all duration-300",
                product.stock === 0 
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
              )}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}