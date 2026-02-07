import React from 'react';
import { Check, Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const trackingSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'paid', label: 'Payment Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing Order', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle }
];

const statusOrder = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

export default function OrderTrackingTimeline({ order }) {
  const currentStatusIndex = statusOrder.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
        <XCircle className="w-6 h-6 text-red-600 mr-3" />
        <div>
          <p className="font-semibold text-red-800">Order Cancelled</p>
          <p className="text-sm text-red-600">This order has been cancelled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200" />
        <div 
          className="absolute left-6 top-6 w-0.5 bg-gradient-to-b from-blue-600 to-purple-600 transition-all duration-500"
          style={{ 
            height: currentStatusIndex >= 0 
              ? `${(currentStatusIndex / (trackingSteps.length - 1)) * 100}%` 
              : '0%'
          }}
        />

        {/* Steps */}
        <div className="space-y-8">
          {trackingSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const isUpcoming = index > currentStatusIndex;

            return (
              <div key={step.key} className="relative flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                  isCompleted ? "bg-gradient-to-br from-blue-600 to-purple-600 border-blue-600" : 
                  isCurrent ? "bg-white border-blue-600 shadow-lg" : 
                  "bg-white border-gray-300"
                )}>
                  {isCompleted ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : (
                    <Icon className={cn(
                      "w-6 h-6",
                      isCurrent ? "text-blue-600" : "text-gray-400"
                    )} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <p className={cn(
                    "font-semibold transition-colors",
                    isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                  )}>
                    {step.label}
                  </p>
                  {isCompleted && (
                    <p className="text-sm text-gray-500 mt-1">
                      {index === currentStatusIndex && order.updated_date
                        ? format(new Date(order.updated_date), 'MMM dd, yyyy • h:mm a')
                        : index === 0 && order.created_date
                        ? format(new Date(order.created_date), 'MMM dd, yyyy • h:mm a')
                        : 'Completed'}
                    </p>
                  )}
                  {isCurrent && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                      <p className="text-sm font-medium text-blue-600">In Progress</p>
                    </div>
                  )}
                  {isUpcoming && (
                    <p className="text-sm text-gray-400 mt-1">Pending</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracking Number */}
      {order.tracking_number && order.status !== 'pending' && order.status !== 'paid' && (
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Tracking Number</p>
              <p className="text-lg font-mono font-bold text-gray-900 mt-1">{order.tracking_number}</p>
            </div>
            <Truck className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Your package is {order.status === 'shipped' ? 'on its way' : 'being prepared for shipment'}
          </p>
        </div>
      )}

      {/* Estimated Delivery */}
      {(order.status === 'shipped' || order.status === 'processing') && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Estimated Delivery:</span>{' '}
            {order.status === 'shipped' ? '2-3 business days' : '3-5 business days'}
          </p>
        </div>
      )}
    </div>
  );
}