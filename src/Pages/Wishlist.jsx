import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function Wishlist() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {
        base44.auth.redirectToLogin(createPageUrl('Wishlist'));
      });
  }, []);

  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ['wishlist', user?.email],
    queryFn: () => user ? base44.entities.WishlistItem.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
    initialData: [],
  });

  useEffect(() => {
    setWishlistIds(wishlistItems.map(w => w.product_id));
  }, [wishlistItems]);

  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

  const handleAddToCart = async (product) => {
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
    const existing = wishlistItems.find(w => w.product_id === product.id);
    if (existing) {
      await base44.entities.WishlistItem.delete(existing.id);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Wishlist</h1>
        <p className="text-gray-600 mb-8">
          {wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} saved
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isInWishlist={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Save items you love for later</p>
            <Link to={createPageUrl('ProductCatalog')}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-6 text-lg font-semibold">
                Explore Products
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}