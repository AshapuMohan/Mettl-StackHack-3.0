import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Truck, Shield, Lock } from 'lucide-react';
import axios from 'axios';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Shipping Address
    shippingAddress: {
      name: user?.name || '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: user?.phone || ''
    },
    // Billing Address
    billingAddress: {
      name: user?.name || '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    // Payment
    paymentMethod: 'card',
    sameAsBilling: true
  });

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSameAsBillingChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      sameAsBilling: checked,
      billingAddress: checked ? { ...prev.shippingAddress } : prev.billingAddress
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if user is authenticated
      if (!user) {
        alert('Please log in to place an order');
        navigate('/login');
        return;
      }

      // Validate cart items
      if (!cart.items || cart.items.length === 0) {
        alert('Your cart is empty');
        navigate('/cart');
        return;
      }

      // Validate form data
      if (!formData.shippingAddress.name || !formData.shippingAddress.street || 
          !formData.shippingAddress.city || !formData.shippingAddress.state || 
          !formData.shippingAddress.zipCode || !formData.shippingAddress.phone) {
        alert('Please fill in all required shipping address fields');
        return;
      }

      // Validate cart items have required fields
      const invalidItems = cart.items.filter(item => !item.productId || !item.quantity || item.quantity <= 0);
      if (invalidItems.length > 0) {
        alert('Some items in your cart are invalid. Please refresh your cart.');
        navigate('/cart');
        return;
      }

      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
          variant: item.variant || null
        })),
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.sameAsBilling ? formData.shippingAddress : formData.billingAddress,
        paymentMethod: formData.paymentMethod
      };

      console.log('Sending order data:', orderData);

      const response = await axios.post('/api/orders', orderData);
      
      // Clear cart and redirect to order confirmation
      clearCart();
      navigate(`/orders/${response.data._id}/track`);
    } catch (error) {
      console.error('Order creation failed:', error);
      
      let errorMessage = 'Failed to create order. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Please log in to place an order';
        navigate('/login');
        return;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(', ');
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getCartTotal();
  const shipping = 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Truck className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shippingAddress.name}
                  onChange={(e) => handleInputChange('shippingAddress', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shippingAddress.street}
                  onChange={(e) => handleInputChange('shippingAddress', 'street', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shippingAddress.city}
                  onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shippingAddress.state}
                  onChange={(e) => handleInputChange('shippingAddress', 'state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shippingAddress.zipCode}
                  onChange={(e) => handleInputChange('shippingAddress', 'zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.shippingAddress.phone}
                  onChange={(e) => handleInputChange('shippingAddress', 'phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Billing Address</h2>
              </div>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.sameAsBilling}
                  onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Same as shipping</span>
              </label>
            </div>

            {!formData.sameAsBilling && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.billingAddress.name}
                    onChange={(e) => handleInputChange('billingAddress', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.billingAddress.street}
                    onChange={(e) => handleInputChange('billingAddress', 'street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.billingAddress.city}
                    onChange={(e) => handleInputChange('billingAddress', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.billingAddress.state}
                    onChange={(e) => handleInputChange('billingAddress', 'state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.billingAddress.zipCode}
                    onChange={(e) => handleInputChange('billingAddress', 'zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Lock className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <CreditCard className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Credit/Debit Card</span>
              </label>

              <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={formData.paymentMethod === 'paypal'}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="w-5 h-5 bg-blue-600 rounded"></div>
                <span className="font-medium">PayPal</span>
              </label>

              <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <Truck className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Cash on Delivery</span>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            {/* Items */}
            <div className="space-y-3 mb-6">
              {cart.items.map((item) => (
                <div key={`${item.productId}-${JSON.stringify(item.variant)}`} className="flex justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">${shipping.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Place Order</span>
                </>
              )}
            </button>

            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>By placing your order, you agree to our Terms of Service and Privacy Policy.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;