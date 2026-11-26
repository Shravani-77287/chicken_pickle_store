// frontend/app/track/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import API from '../../lib/api';
import {
  ArrowLeft,
  Search,
  Truck,
  Phone,
  Flame,
  Package,
  CheckCircle2,
  MapPin,
  AlertCircle,
} from 'lucide-react';

export default function TrackOrderPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setErrorMessage('');
    setSearched(true);

    try {
      const res = await API.get(`/orders/track/${phone.trim()}`);
      setOrders(res.data);
    } catch (error) {
      setOrders([]);
      setErrorMessage(
        error.response?.data?.message || 'No orders found for this phone number.'
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 'Preparing Batch', label: 'Preparing Batch', icon: Flame },
    { id: 'Packed', label: 'Packed', icon: Package },
    { id: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
    { id: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const getStepIndex = (status) => {
    const idx = steps.findIndex((s) => s.id === status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <main className="min-h-screen bg-amber-50 text-gray-900 pb-16">
      {/* Top Navigation with Go Back Button */}
      <header className="bg-white border-b border-amber-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-red-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-full transition"
          >
            <ArrowLeft size={15} />
            <span>Go Back to Store</span>
          </Link>

          <span className="text-sm font-black text-red-800 tracking-wide">
            ORDER TRACKER
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-12 space-y-6">
        {/* Search Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-amber-200 text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-800 rounded-2xl flex items-center justify-center mx-auto">
            <Truck size={24} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Track Your Pickle Order
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Enter the phone number used during checkout to check live batch & delivery updates.
          </p>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto pt-2">
            <div className="relative flex-1">
              <Phone size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="tel"
                required
                placeholder="Enter 10-digit Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-red-800 hover:bg-red-900 text-white font-bold px-6 py-3 rounded-full text-xs flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50"
            >
              <Search size={15} />
              <span>{loading ? 'Searching...' : 'Track'}</span>
            </button>
          </form>
        </div>

        {/* Error Box */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-800 text-xs font-bold">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Order Results */}
        {searched && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const currentStep = getStepIndex(order.status);

              return (
                <div key={order._id} className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-5">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-[11px] font-bold bg-amber-100 text-red-900 px-2.5 py-1 rounded-full">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-500 mt-1.5">
                        Placed on {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">Total Paid</span>
                      <span className="text-base font-black text-red-800">₹{order.totalPrice}</span>
                    </div>
                  </div>

                  {/* Progress Stepper */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {steps.map((step, idx) => {
                      const Icon = step.icon;
                      const active = idx <= currentStep;
                      return (
                        <div key={step.id} className="flex flex-col items-center text-center space-y-1.5">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition ${
                              active
                                ? 'bg-red-800 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            <Icon size={18} />
                          </div>
                          <span className={`text-[11px] font-bold ${active ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Items & Address */}
                  <div className="bg-amber-50/70 p-4 rounded-2xl text-xs space-y-2">
                    <div className="flex items-start gap-2 text-gray-700">
                      <MapPin size={15} className="text-red-800 shrink-0 mt-0.5" />
                      <span>
                        <strong>{order.customer?.name}</strong> — {order.customer?.address} ({order.customer?.pincode})
                      </span>
                    </div>
                    <div className="border-t border-amber-200/70 pt-2 space-y-1">
                      {order.orderItems?.map((item, i) => (
                        <div key={i} className="flex justify-between text-gray-800">
                          <span>{item.quantity}x {item.name} ({item.weight})</span>
                          <span className="font-bold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}