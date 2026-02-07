import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Tag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function CartSummary({ items = [], onCheckout }) {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product_snapshot?.price || 0) * item.quantity,
    0
  );
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 1000 ? 0 : 15;
  const total = subtotal + tax + shipping;

  return (
    <Card className="sticky top-4 shadow-lg border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-blue-600" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Items count */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items ({items.length})</span>
          <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-900">
            {shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>

        {/* Free shipping banner */}
        {subtotal < 1000 && subtotal > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <Tag className="w-4 h-4 text-blue-600 mt-0.5" />
            <p className="text-xs text-blue-700">
              Add <span className="font-semibold">${(1000 - subtotal).toFixed(2)}</span> more for FREE shipping
            </p>
          </div>
        )}

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (10%)</span>
          <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">${total.toFixed(2)}</span>
        </div>

        {/* Checkout Button */}
        <Button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full py-6 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Proceed to Checkout
        </Button>

        {/* Security badges */}
        <div className="pt-4 space-y-2 text-xs text-gray-500 text-center">
          <p>🔒 Secure checkout with encryption</p>
          <p>✓ 30-day return policy</p>
        </div>
      </CardContent>
    </Card>
  );
}