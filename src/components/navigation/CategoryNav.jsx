import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Laptop, Monitor, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { name: 'Laptops', value: 'laptop', icon: Laptop, gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Desktops', value: 'desktop', icon: Monitor, gradient: 'from-purple-500 to-pink-500' },
  { name: 'Accessories', value: 'accessory', icon: Headphones, gradient: 'from-orange-500 to-red-500' },
];

export default function CategoryNav({ activeCategory }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <Link to={createPageUrl('ProductCatalog')}>
        <div
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 whitespace-nowrap",
            !activeCategory
              ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg"
              : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md"
          )}
        >
          <span className="font-medium">All Products</span>
        </div>
      </Link>
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.value;
        return (
          <Link key={cat.value} to={createPageUrl(`ProductCatalog?category=${cat.value}`)}>
            <div
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 whitespace-nowrap",
                isActive
                  ? `bg-gradient-to-r ${cat.gradient} text-white shadow-lg`
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{cat.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}