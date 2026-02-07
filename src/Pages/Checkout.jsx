import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Lock, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function Checkout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    phone: ''
  });

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        setShippingInfo(prev => ({ ...prev, full_name: u.full_name || '' }));
      })
      .catch(() => {
        base44.auth.redirectToLogin(createPageUrl('Checkout'));
      });
  }, []);

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart', user?.email],
    queryFn: () => user ? base44.entities.CartItem.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product_snapshot?.price || 0) * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const shipping = subtotal > 1000 ? 0 : 15;
  const total = subtotal + tax + shipping;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Validate shipping info
    const requiredFields = ['full_name', 'address_line1', 'city', 'state', 'zip_code', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required shipping information');
      setIsProcessing(false);
      return;
    }

    const orderItems = cartItems.map(item => ({
      product_id: item.product_id,
      product_name: item.product_snapshot?.name,
      product_image: item.product_snapshot?.image,
      quantity: item.quantity,
      price: item.product_snapshot?.price
    }));

    await base44.entities.Order.create({
      user_email: user.email,
      items: orderItems,
      total_price: total,
      status: 'paid',
      shipping_address: shippingInfo,
      payment_method: 'Credit Card'
    });

    // Clear cart
    for (const item of cartItems) {
      await base44.entities.CartItem.delete(item.id);
    }

    toast.success('Order placed successfully!');
    setIsProcessing(false);
    navigate(createPageUrl('Orders'));
  };

  if (!user) return null;

  if (cartItems.length === 0) {
    navigate(createPageUrl('Cart'));
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={shippingInfo.full_name}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, full_name: e.target.value })}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address_line1">Address Line 1 *</Label>
                    <Input
                      id="address_line1"
                      value={shippingInfo.address_line1}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address_line1: e.target.value })}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address_line2">Address Line 2</Label>
                    <Input
                      id="address_line2"
                      value={shippingInfo.address_line2}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address_line2: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zip_code">ZIP Code *</Label>
                      <Input
                        id="zip_code"
                        value={shippingInfo.zip_code}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, zip_code: e.target.value })}
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={shippingInfo.country}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Payment Information (Simulated) */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Secure Checkout</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Payment processing is simulated in this demo. Click "Place Order" to complete.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-gray-200 sticky top-4">
              <CardHeader className="border-b border-gray-100">
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Items Preview */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.product_snapshot?.image || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100'}
                        alt={item.product_snapshot?.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product_snapshot?.name}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        ${((item.product_snapshot?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? <span className="text-green-600">FREE</span> : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full py-6 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </Button>

                <p className="text-xs text-center text-gray-500 pt-2">
                  🔒 Your payment information is secure
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}