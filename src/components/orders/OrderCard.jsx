import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, MapPin, Star } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import OrderTrackingTimeline from './OrderTrackingTimeline';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const statusConfig = {
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending', description: 'Your order is being processed' },
  paid: { icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200', label: 'Payment Confirmed', description: 'Payment received successfully' },
  processing: { icon: Package, color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Processing', description: 'Your order is being prepared' },
  shipped: { icon: Truck, color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Shipped', description: 'Your order is on the way' },
  delivered: { icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200', label: 'Delivered', description: 'Order successfully delivered' },
  cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled', description: 'This order has been cancelled' }
};

export default function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[order.status] || statusConfig.pending;
  const Icon = config.icon;

  // Fetch reviews to check which products have been reviewed
  const { data: reviews = [] } = useQuery({
    queryKey: ['user-reviews', order.user_email],
    queryFn: () => base44.entities.Review.filter({ user_email: order.user_email }),
    initialData: [],
  });

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Order placed</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {format(new Date(order.created_date), 'MMMM dd, yyyy')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ${order.total_price?.toFixed(2)}
              </p>
            </div>
            <Badge className={`${config.color} border flex items-center gap-1 px-3 py-1`}>
              <Icon className="w-3 h-3" />
              {config.label}
            </Badge>
          </div>
        </div>
        
        {/* Status Description */}
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          {config.description}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Order Items Preview */}
          {order.items?.slice(0, expanded ? order.items.length : 3).map((item, index) => {
            const hasReviewed = reviews.some(r => r.product_id === item.product_id);
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-4">
                  <img
                    src={item.product_image || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100'}
                    alt={item.product_name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.product_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                {order.status === 'delivered' && !hasReviewed && (
                  <Link to={createPageUrl(`ProductDetail?id=${item.product_id}`)}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Star className="w-4 h-4 mr-2" />
                      Write a Review
                    </Button>
                  </Link>
                )}
                {hasReviewed && order.status === 'delivered' && (
                  <div className="text-center">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Review submitted
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
          
          {!expanded && order.items?.length > 3 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              +{order.items.length - 3} more item(s)
            </p>
          )}

          {/* Shipping Address Preview */}
          {expanded && order.shipping_address && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{order.shipping_address.full_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {order.shipping_address.address_line1}
                    {order.shipping_address.address_line2 && <>, {order.shipping_address.address_line2}</>}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.shipping_address.country}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tracking Timeline (Expanded) */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
              >
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Tracking</h4>
                <OrderTrackingTimeline order={order} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Track Order Button */}
          <Button
            onClick={() => setExpanded(!expanded)}
            variant="outline"
            className="w-full mt-4 rounded-xl font-semibold"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Hide Tracking Details
              </>
            ) : (
              <>
                <Truck className="w-4 h-4 mr-2" />
                Track Order
                <ChevronDown className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}