import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { product_snapshot, quantity } = item;
  const itemTotal = (product_snapshot?.price || 0) * quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex gap-4">
        {/* Product Image */}
        <Link to={createPageUrl(`ProductDetail?id=${item.product_id}`)}>
          <img
            src={product_snapshot?.image || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200'}
            alt={product_snapshot?.name}
            className="w-24 h-24 object-cover rounded-lg hover:opacity-80 transition-opacity"
          />
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <Link to={createPageUrl(`ProductDetail?id=${item.product_id}`)}>
            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
              {product_snapshot?.name}
            </h3>
          </Link>
          
          <p className="text-lg font-bold text-gray-900 mt-2">
            ${product_snapshot?.price?.toLocaleString()}
          </p>

          {/* Stock warning */}
          {product_snapshot?.stock < 10 && product_snapshot?.stock > 0 && (
            <p className="text-xs text-orange-600 mt-1">
              Only {product_snapshot.stock} left in stock
            </p>
          )}

          {/* Quantity Controls */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onUpdateQuantity(item, quantity - 1)}
                disabled={quantity <= 1}
                className="h-9 w-9 rounded-l-lg hover:bg-gray-100"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center font-medium text-gray-900">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onUpdateQuantity(item, quantity + 1)}
                disabled={quantity >= (product_snapshot?.stock || 0)}
                className="h-9 w-9 rounded-r-lg hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(item)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Item Total */}
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">
            ${itemTotal.toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}