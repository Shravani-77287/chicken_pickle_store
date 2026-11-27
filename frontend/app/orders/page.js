// frontend/app/orders/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import API from '../../lib/api';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../../components/CartDrawer';
import {
  ArrowLeft,
  Package,
  Truck,
  XCircle,
  RefreshCw,
  ShoppingBag,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const router = useRouter();
  const { totalItems, setIsCartOpen, addToCart } = useCart();

  const fetchMyOrders = async () => {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('customer_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await API.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        router.push('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to load your order history');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancellingId(orderId);
    try {
      await API.put(`/orders/${orderId}/cancel`);
      await fetchMyOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const handleReorder = (order) => {
    order.orderItems?.forEach((item) => {
      addToCart(
        { _id: item.product || item._id, name: item.name },
        { weight: item.weight, price: item.price, originalPrice: item.price + 50 }
      );
    });
    setIsCartOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Packed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-amber-100 text-amber-900 border-amber-200';
    }
  };

  return (
    <main className="min-h-screen bg-amber-50 text-gray-900 pb-16">
      <CartDrawer />

      {/* Top Navigation */}
      <header className="bg-white border-b border-amber-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-red-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-full transition"
          >
            <ArrowLeft size={15} />
            <span>Go Back to Store</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMyOrders}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition"
              title="Refresh Orders"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-amber-100 text-red-900 px-4 py-2 rounded-full font-bold text-xs hover:bg-amber-200 transition"
            >
              <ShoppingBag size={15} />
              <span suppressHydrationWarning>Cart ({totalItems})</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">My Orders</h1>
          <p className="text-xs text-gray-500">View your pickle order history, track delivery, or reorder favorites</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-2.5 text-red-800 text-xs font-bold">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-sm font-bold text-gray-500">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-amber-200 text-center space-y-3 shadow-sm">
            <Package size={48} className="mx-auto text-gray-400" />
            <h3 className="text-lg font-black text-gray-900">No orders yet</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              You haven’t placed any orders yet. Explore our fresh homestyle chicken pickles!
            </p>
            <Link
              href="/"
              className="inline-block bg-red-800 text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-red-900 transition mt-2"
            >
              Order Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200 shadow-sm space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-wrap justify-between items-start gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-900">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-red-800 block">₹{order.totalPrice}</span>
                    <span className="text-[10px] font-bold text-gray-500">
                      {order.paymentMethod} • {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-1.5 text-xs">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-gray-800">
                      <span>
                        <strong>{item.quantity}x</strong> {item.name} ({item.weight} Jar)
                      </span>
                      <span className="font-bold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="bg-amber-50/70 p-3 rounded-2xl text-[11px] text-gray-700 flex items-start gap-2">
                  <MapPin size={14} className="text-red-800 shrink-0 mt-0.5" />
                  <span>
                    {order.customer?.address} — <strong>{order.customer?.pincode}</strong>
                  </span>
                </div>

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {order.status !== 'Cancelled' && (
                      <Link
                        href="/track"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-red-900 bg-amber-100 hover:bg-amber-200 px-3.5 py-2 rounded-xl transition"
                      >
                        <Truck size={14} />
                        <span>Track Live</span>
                      </Link>
                    )}

                    <button
                      onClick={() => handleReorder(order)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition"
                    >
                      <CheckCircle2 size={14} />
                      <span>Reorder</span>
                    </button>
                  </div>

                  {order.status === 'Preparing Batch' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={cancellingId === order._id}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      <span>{cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}