import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowLeft, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import OrderCard from '../components/orders/OrderCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Orders() {
  const [user, setUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-created_date');

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {
        base44.auth.redirectToLogin(createPageUrl('Orders'));
      });
  }, []);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: () => user ? base44.entities.Order.filter({ user_email: user.email }, '-created_date') : [],
    enabled: !!user,
    initialData: [],
  });

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => statusFilter === 'all' || order.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === '-created_date') {
        return new Date(b.created_date) - new Date(a.created_date);
      } else if (sortBy === 'created_date') {
        return new Date(a.created_date) - new Date(b.created_date);
      } else if (sortBy === '-total_price') {
        return b.total_price - a.total_price;
      } else if (sortBy === 'total_price') {
        return a.total_price - b.total_price;
      }
      return 0;
    });

  // Calculate stats
  const totalSpent = orders.reduce((sum, order) => sum + order.total_price, 0);
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="mb-4 dark:hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Order History</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage your orders
            </p>
          </div>
          {orders.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${totalSpent.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{orders.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.delivered || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">In Transit</p>
              <p className="text-2xl font-bold text-blue-600">{(statusCounts.shipped || 0) + (statusCounts.processing || 0)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{(statusCounts.pending || 0) + (statusCounts.paid || 0)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        {orders.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Filter by Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="all">All Orders ({orders.length})</SelectItem>
                    <SelectItem value="pending">Pending ({statusCounts.pending || 0})</SelectItem>
                    <SelectItem value="paid">Paid ({statusCounts.paid || 0})</SelectItem>
                    <SelectItem value="processing">Processing ({statusCounts.processing || 0})</SelectItem>
                    <SelectItem value="shipped">Shipped ({statusCounts.shipped || 0})</SelectItem>
                    <SelectItem value="delivered">Delivered ({statusCounts.delivered || 0})</SelectItem>
                    <SelectItem value="cancelled">Cancelled ({statusCounts.cancelled || 0})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">
                  Sort by
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="-created_date">
                      <TrendingDown className="w-4 h-4 inline mr-1" />
                      Newest First
                    </SelectItem>
                    <SelectItem value="created_date">
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      Oldest First
                    </SelectItem>
                    <SelectItem value="-total_price">Highest Price</SelectItem>
                    <SelectItem value="total_price">Lowest Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {statusFilter !== 'all' && (
              <div className="mt-3">
                <Badge variant="outline" className="dark:bg-gray-700 dark:border-gray-600">
                  Showing {filteredOrders.length} of {orders.length} orders
                </Badge>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl dark:bg-gray-800" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          filteredOrders.length > 0 ? (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                <Package className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No orders found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">Try adjusting your filters</p>
              <Button onClick={() => setStatusFilter('all')} variant="outline" className="dark:bg-gray-800 dark:border-gray-700">
                Clear Filters
              </Button>
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
              <Package className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No orders yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Start shopping to see your orders here</p>
            <Link to={createPageUrl('ProductCatalog')}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-6 text-lg font-semibold">
                Browse Products
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}