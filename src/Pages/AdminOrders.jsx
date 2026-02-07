import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminOrders() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(userData => {
      if (userData.role !== 'admin') {
        window.location.href = createPageUrl('Home');
      }
      setUser(userData);
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => base44.entities.Order.update(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated');
    },
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    paid: { icon: CheckCircle, color: 'bg-blue-100 text-blue-800', label: 'Paid' },
    processing: { icon: Package, color: 'bg-purple-100 text-purple-800', label: 'Processing' },
    shipped: { icon: Truck, color: 'bg-cyan-100 text-cyan-800', label: 'Shipped' },
    delivered: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Delivered' },
    cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Cancelled' },
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('AdminDashboard')}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">{orders.length} total orders</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by order ID or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status]?.icon || Package;
              const isExpanded = expandedOrder === order.id;
              
              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {format(new Date(order.created_date), 'PPp')}
                          </p>
                        </div>
                        <Badge className={statusConfig[order.status]?.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[order.status]?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="text-xl font-bold text-gray-900">${order.total_price.toLocaleString()}</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        >
                          {isExpanded ? 'Hide' : 'Details'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Customer Info */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                          <div className="space-y-2 text-sm">
                            <p><span className="text-gray-500">Email:</span> {order.user_email}</p>
                            {order.shipping_address && (
                              <>
                                <p><span className="text-gray-500">Name:</span> {order.shipping_address.full_name}</p>
                                <p><span className="text-gray-500">Phone:</span> {order.shipping_address.phone}</p>
                                <p className="text-gray-500">Address:</p>
                                <p className="pl-4">
                                  {order.shipping_address.address_line1}<br />
                                  {order.shipping_address.address_line2 && <>{order.shipping_address.address_line2}<br /></>}
                                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}<br />
                                  {order.shipping_address.country}
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Order Management */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Order Management</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm text-gray-500 block mb-2">Update Status</label>
                              <Select
                                value={order.status}
                                onValueChange={(status) => updateStatusMutation.mutate({ orderId: order.id, status })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="paid">Paid</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {order.tracking_number && (
                              <div>
                                <label className="text-sm text-gray-500 block mb-1">Tracking Number</label>
                                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{order.tracking_number}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                        <div className="space-y-3">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <img
                                src={item.product_image || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=80'}
                                alt={item.product_name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.product_name}</p>
                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                              </div>
                              <p className="font-bold text-gray-900">${(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}