import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, TrendingUp, Zap, CheckCircle, Package } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import CategoryNav from '../components/navigation/CategoryNav';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Home() {
  const [user, setUser] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date', 100),
    initialData: []
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist', user?.email],
    queryFn: () => user ? base44.entities.WishlistItem.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: []
  });

  useEffect(() => {
    setWishlistIds(wishlist.map((w) => w.product_id));
  }, [wishlist]);

  const featuredProducts = products.filter((p) => p.featured);
  const trendingProducts = products.filter((p) => p.trending);

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

    const existing = wishlist.find((w) => w.product_id === product.id);
    if (existing) {
      await base44.entities.WishlistItem.delete(existing.id);
      setWishlistIds((prev) => prev.filter((id) => id !== product.id));
      toast.success('Removed from wishlist');
    } else {
      await base44.entities.WishlistItem.create({
        user_email: user.email,
        product_id: product.id
      });
      setWishlistIds((prev) => [...prev, product.id]);
      toast.success('Added to wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="bg-gray-600 mx-auto px-4 py-20 relative max-w-7xl sm:px-6 lg:px-8 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6">

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Premium Tech Store</span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              Power Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
                Digital Life
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-2xl mx-auto">
              Explore premium laptops, desktops, and accessories from top brands
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link to={createPageUrl('ProductCatalog')}>
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 rounded-full px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all">

                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CategoryNav />
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 &&
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Featured Products</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) =>
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            isInWishlist={wishlistIds.includes(product.id)} />

          )}
          </div>
        </section>
      }

      {/* Trending Products */}
      {trendingProducts.length > 0 &&
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.slice(0, 8).map((product) =>
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            isInWishlist={wishlistIds.includes(product.id)} />

          )}
          </div>
        </section>
      }

      {/* Why Shop With Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">

            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Free shipping on orders over $1,000</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">

            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Warranty Included</h3>
            <p className="text-gray-600">All products come with manufacturer warranty</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">

            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">30-Day Returns</h3>
            <p className="text-gray-600">Easy returns within 30 days of purchase</p>
          </motion.div>
        </div>
      </section>
    </div>);

}