import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import ProductGallery from '../components/products/ProductGallery';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewCard from '../components/reviews/ReviewCard';
import ReviewStats from '../components/reviews/ReviewStats';
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, Cpu, HardDrive, Monitor, Zap, Weight, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const [user, setUser] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => base44.entities.Review.filter({ product_id: productId }, '-created_date'),
    enabled: !!productId,
    initialData: [],
  });

  const { data: userOrders = [] } = useQuery({
    queryKey: ['user-orders', user?.email],
    queryFn: () => user ? base44.entities.Order.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  // Check if user has purchased and can review
  const hasPurchased = userOrders.some(order => 
    order.status === 'delivered' && 
    order.items?.some(item => item.product_id === productId)
  );

  const hasReviewed = reviews.some(review => review.user_email === user?.email);

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist', user?.email],
    queryFn: () => user ? base44.entities.WishlistItem.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  useEffect(() => {
    setIsInWishlist(wishlist.some(w => w.product_id === productId));
  }, [wishlist, productId]);

  const handleAddToCart = async () => {
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
        quantity: existingItem[0].quantity + quantity
      });
    } else {
      await base44.entities.CartItem.create({
        user_email: user.email,
        product_id: product.id,
        quantity,
        product_snapshot: {
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          stock: product.stock
        }
      });
    }
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    const existing = wishlist.find(w => w.product_id === productId);
    if (existing) {
      await base44.entities.WishlistItem.delete(existing.id);
      setIsInWishlist(false);
      toast.success('Removed from wishlist');
    } else {
      await base44.entities.WishlistItem.create({
        user_email: user.email,
        product_id: productId
      });
      setIsInWishlist(true);
      toast.success('Added to wishlist');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-500">Product not found</p>
          <Link to={createPageUrl('ProductCatalog')}>
            <Button className="mt-4">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to={createPageUrl('Home')} className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <Link to={createPageUrl(`ProductCatalog?category=${product.category}`)} className="hover:text-gray-900">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Gallery */}
          <div>
            <ProductGallery images={product.images} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand */}
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              {product.brand}
            </p>

            {/* Product Name */}
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-bold text-gray-900">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-500">
                  ({product.reviews_count || 0} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-900">
                ${product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ${product.original_price.toLocaleString()}
                  </span>
                  <Badge className="bg-red-500 text-white">
                    Save {discountPercent}%
                  </Badge>
                </>
              )}
            </div>

            {/* Stock Status */}
            {product.stock > 0 ? (
              <p className="text-green-600 font-medium">
                ✓ In stock ({product.stock} available)
              </p>
            ) : (
              <p className="text-red-600 font-medium">Out of stock</p>
            )}

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
              
              {/* Key Specs Highlights */}
              {product.specs && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {product.specs.processor && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Cpu className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-blue-600 font-semibold">Processor</p>
                        <p className="text-sm font-bold text-gray-900">{product.specs.processor}</p>
                      </div>
                    </div>
                  )}
                  {product.specs.ram && (
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <Zap className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-purple-600 font-semibold">RAM</p>
                        <p className="text-sm font-bold text-gray-900">{product.specs.ram}</p>
                      </div>
                    </div>
                  )}
                  {product.specs.storage && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <HardDrive className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-green-600 font-semibold">Storage</p>
                        <p className="text-sm font-bold text-gray-900">{product.specs.storage}</p>
                      </div>
                    </div>
                  )}
                  {product.specs.display && (
                    <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <Monitor className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-orange-600 font-semibold">Display</p>
                        <p className="text-sm font-bold text-gray-900">{product.specs.display}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="font-semibold text-gray-900">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="w-16 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={handleToggleWishlist}
                variant="outline"
                className={cn(
                  "px-6 py-6 rounded-xl border-2 transition-all",
                  isInWishlist
                    ? "bg-red-50 border-red-500 text-red-600 hover:bg-red-100"
                    : "border-gray-300 hover:border-red-500 hover:text-red-600"
                )}
              >
                <Heart className={cn("w-5 h-5", isInWishlist && "fill-current")} />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200">
                <Truck className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-xs font-medium text-gray-900">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders $1000+</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200">
                <Shield className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-xs font-medium text-gray-900">Warranty</p>
                <p className="text-xs text-gray-500">Manufacturer</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200">
                <RotateCcw className="w-8 h-8 text-purple-600 mb-2" />
                <p className="text-xs font-medium text-gray-900">30-Day Return</p>
                <p className="text-xs text-gray-500">Easy returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <Card className="mt-12 shadow-sm border-gray-200 bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-600" />
                Technical Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specs).map(([key, value]) => {
                  const getIcon = () => {
                    if (key === 'processor') return <Cpu className="w-5 h-5 text-blue-600" />;
                    if (key === 'ram') return <Zap className="w-5 h-5 text-purple-600" />;
                    if (key === 'storage') return <HardDrive className="w-5 h-5 text-green-600" />;
                    if (key === 'display') return <Monitor className="w-5 h-5 text-orange-600" />;
                    if (key === 'weight') return <Weight className="w-5 h-5 text-gray-600" />;
                    if (key === 'connectivity') return <Wifi className="w-5 h-5 text-indigo-600" />;
                    return <Star className="w-5 h-5 text-gray-600" />;
                  };
                  
                  return value && (
                    <div key={key} className="flex items-center gap-3 py-3 px-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      {getIcon()}
                      <div className="flex-1">
                        <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="block text-base font-bold text-gray-900 mt-0.5">{value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews Section */}
        <div className="mt-12 space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          
          {/* Review Stats */}
          {reviews.length > 0 && (
            <ReviewStats reviews={reviews} />
          )}

          {/* Write Review Form */}
          {user && hasPurchased && !hasReviewed && (
            <ReviewForm 
              productId={productId} 
              user={user}
              onSuccess={() => {}}
            />
          )}

          {user && !hasPurchased && (
            <Card className="p-6 border-gray-300">
              <p className="text-gray-600 text-center">
                Purchase this product to leave a review
              </p>
            </Card>
          )}

          {user && hasReviewed && (
            <Card className="p-4 bg-green-50 border-green-200">
              <p className="text-green-800 text-center font-medium">
                Thank you for your review!
              </p>
            </Card>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                All Reviews ({reviews.length})
              </h3>
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No reviews yet</p>
                <p className="text-gray-400 text-sm mt-2">Be the first to review this product!</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}