// frontend/app/track/page.js
'use client';

import { useState } from 'react';
import API from '../../lib/api';
import { Search, Package, Truck, Flame, CheckCircle, Phone, MapPin, Loader2 } from 'lucide-react';

export default function TrackOrder() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError('');
    setOrders(null);

    try {
      const response = await API.get(`/orders/track/${phone.trim()}`);
      setOrders(response.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'No orders found. Check your phone number.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'Preparing Batch':
        return 1;
      case 'Packed':
        return 2;
      case 'Out for Delivery':
        return 3;
      case 'Delivered':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-amber-200 text-center">
          <div className="w-12 h-12 bg-red-100 text-red-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Truck size={24} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Track Your Pickle Order</h1>
          <p className="text-xs text-gray-600 mt-1">
            Enter the phone number used during checkout to check live batch & delivery updates.
          </p>

          {/* Search Form */}
          <form onSubmit={handleTrack} className="mt-6 max-w-md mx-auto flex gap-2">
            <div className="relative flex-1">
              <Phone size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="tel"
                required
                placeholder="Enter 10-digit Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs text-black placeholder:text-gray-400 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-800 font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-800 text-white font-bold px-5 py-3 rounded-2xl hover:bg-red-900 transition flex items-center gap-2 text-xs shrink-0 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              <span>Track</span>
            </button>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-2xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* Order Results */}
        {orders && (
          <div className="space-y-6">
            {orders.map((order) => {
              const currentStep = getStatusStep(order.status);

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-amber-200 space-y-6"
                >
                  {/* Order Meta Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-xs text-gray-400 block">Order ID: #{order._id.slice(-6).toUpperCase()}</span>
                      <h3 className="font-black text-gray-900 text-base">{order.customer.name}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-red-800 bg-red-50 px-3 py-1 rounded-full">
                        ₹{order.totalPrice} ({order.paymentMethod})
                      </span>
                    </div>
                  </div>

                  {/* VISUAL TRACKING PROGRESS BAR */}
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 text-center relative">
                      {/* Step 1 */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs mb-2 transition ${
                            currentStep >= 1 ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Flame size={18} />
                        </div>
                        <span className="text-[11px] font-bold text-black">Preparing</span>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs mb-2 transition ${
                            currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Package size={18} />
                        </div>
                        <span className="text-[11px] font-bold text-black">Packed</span>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs mb-2 transition ${
                            currentStep >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Truck size={18} />
                        </div>
                        <span className="text-[11px] font-bold text-black">Out for Delivery</span>
                      </div>

                      {/* Step 4 */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs mb-2 transition ${
                            currentStep >= 4 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <CheckCircle size={18} />
                        </div>
                        <span className="text-[11px] font-bold text-black">Delivered</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="bg-amber-50/50 p-4 rounded-2xl space-y-2 text-xs">
                    <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">Items in Order</h4>
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-black font-medium">
                        <span>
                          {item.quantity}x {item.name} ({item.weight})
                        </span>
                        <span className="font-bold">₹{item.price * item.quantity}</span>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-amber-200/60 text-gray-600 flex items-start gap-1">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-gray-500" />
                      <span>
                        Delivering to: <strong className="text-black">{order.customer.address} ({order.customer.pincode})</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}