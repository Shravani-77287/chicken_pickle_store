// frontend/app/track/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import API from '../../lib/api';
import {
  ArrowLeft,
  Search,
  Package,
  Truck,
  CheckCircle,
  Flame,
  MapPin,
  Copy,
  Check,
  XCircle,
} from 'lucide-react';

const STEPS = ['Preparing Batch', 'Packed', 'Out for Delivery', 'Delivered'];

export default function TrackOrderPage() {
  const [identifier, setIdentifier] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setError('');
    setOrders([]);

    try {
      const res = await API.get(`/orders/track/${identifier.trim()}`);
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No orders found for that phone number or Order ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (value, key) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <main className="min-h-screen bg-amber-50 text-gray-900 pb-16">
      <header className="bg-white border-b border-amber-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-red-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-full transition"
          >
            <ArrowLeft size={15} />
            <span>Go Back to Store</span>
          </Link>

          <Link
            href="/orders"
            className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-full transition"
          >
            My Orders
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Track Your Pickle Order</h1>
          <p className="text-xs text-gray-500">
            Enter your 10-digit registered phone number or Order ID to check live batch & courier status
          </p>
        </div>

        <form
          onSubmit={handleTrack}
          className="bg-white p-3 rounded-2xl border border-amber-200 shadow-sm flex gap-2"
        >
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter 10-digit Phone Number or Order ID..."
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-red-800 hover:bg-red-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-4 rounded-2xl text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => {
            const currentStepIndex = STEPS.indexOf(order.status);
            const hasCourierInfo = Boolean(order.courierPartner || order.trackingId);

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-5"
              >
                <div className="flex flex-wrap justify-between items-start gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-900">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(order._id, `order-${order._id}`)}
                        className="text-[10px] font-bold text-gray-600 hover:text-red-800 bg-gray-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1 transition"
                      >
                        {copiedKey === `order-${order._id}` ? (
                          <>
                            <Check size={11} className="text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy Order ID</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-red-800 block">₹{order.totalPrice}</span>
                    <span className="text-[10px] font-bold text-gray-500">{order.paymentMethod}</span>
                  </div>
                </div>

                {/* Progress Stepper or Cancelled Banner */}
                {order.status === 'Cancelled' ? (
                  <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl flex items-center gap-2 text-red-800 text-xs font-bold">
                    <XCircle size={18} />
                    <span>This order was cancelled.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {STEPS.map((step, idx) => {
                      const isDone = idx <= currentStepIndex;
                      const icons = [Flame, Package, Truck, CheckCircle];
                      const StepIcon = icons[idx];

                      return (
                        <div key={step} className="text-center space-y-1.5">
                          <div
                            className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center transition ${
                              isDone
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            <StepIcon size={16} />
                          </div>
                          <p
                            className={`text-[10px] font-bold leading-tight ${
                              isDone ? 'text-gray-900' : 'text-gray-400'
                            }`}
                          >
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Courier Partner & Tracking ID Box */}
                {hasCourierInfo ? (
                  <div className="bg-blue-50/80 border border-blue-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-black text-blue-800 uppercase block">
                        Shipment Dispatch Details
                      </span>
                      <p className="font-bold text-gray-900 mt-0.5">
                        {order.courierPartner || 'Courier Partner'}{' '}
                        {order.trackingId && (
                          <span className="font-mono text-blue-900">• {order.trackingId}</span>
                        )}
                      </p>
                    </div>

                    {order.trackingId && (
                      <button
                        type="button"
                        onClick={() => handleCopy(order.trackingId, `track-${order._id}`)}
                        className="bg-white border border-blue-200 text-blue-800 font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-blue-100 transition"
                      >
                        {copiedKey === `track-${order._id}` ? (
                          <>
                            <Check size={13} className="text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy ID</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  order.status === 'Out for Delivery' && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-[11px] text-amber-900 font-semibold">
                      🚚 Dispatched for delivery! Courier AWB tracking ID will appear here once updated by the store.
                    </div>
                  )
                )}

                {/* Items & Address */}
                <div className="space-y-1.5 text-xs pt-2 border-t border-gray-100">
                  {order.orderItems?.map((item, i) => (
                    <div key={i} className="flex justify-between text-gray-700">
                      <span>
                        <strong>{item.quantity}x</strong> {item.name} ({item.weight})
                      </span>
                      <span className="font-bold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50/70 p-3 rounded-2xl text-[11px] text-gray-700 flex items-start gap-2">
                  <MapPin size={14} className="text-red-800 shrink-0 mt-0.5" />
                  <span>
                    {order.customer?.name} • {order.customer?.address} —{' '}
                    <strong>{order.customer?.pincode}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}