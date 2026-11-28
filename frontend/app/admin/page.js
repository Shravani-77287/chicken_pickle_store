// frontend/app/admin/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '../../lib/api';
import {
  ArrowLeft,
  CheckCircle,
  Phone,
  MapPin,
  RefreshCw,
  AlertTriangle,
  LogOut,
  Package,
  Truck,
  Flame,
  Boxes,
  Plus,
  Trash2,
  Mail,
  Shield,
  Tag,
  X,
  Edit2,
  IndianRupee,
  Search,
  Download,
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState('orders');
  const [adminProfile, setAdminProfile] = useState(null);
  const [showAdminProfileModal, setShowAdminProfileModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeOrderTab, setActiveOrderTab] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [trackingDrafts, setTrackingDrafts] = useState({});
  const [savingTrackingId, setSavingTrackingId] = useState(null);

  // Add Product State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  const [newProductSpice, setNewProductSpice] = useState('Medium');
  const [origPrice250, setOrigPrice250] = useState('350');
  const [offerPrice250, setOfferPrice250] = useState('299');
  const [stock250, setStock250] = useState('25');
  const [origPrice500, setOrigPrice500] = useState('650');
  const [offerPrice500, setOfferPrice500] = useState('549');
  const [stock500, setStock500] = useState('20');

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState(null);

  // Add Coupon State
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState('FLAT');
  const [discountValue, setDiscountValue] = useState('50');
  const [minOrderAmount, setMinOrderAmount] = useState('299');

  const router = useRouter();

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMessage('');

    const token = localStorage.getItem('pickle_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const [ordersRes, productsRes, couponsRes, profileRes] = await Promise.all([
        API.get('/orders'),
        API.get('/products'),
        API.get('/coupons').catch(() => ({ data: [] })),
        API.get('/auth/me').catch(() => ({ data: null })),
      ]);

      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setCoupons(couponsRes.data);

      const drafts = {};
      ordersRes.data.forEach((o) => {
        drafts[o._id] = {
          courierPartner: o.courierPartner || '',
          trackingId: o.trackingId || '',
        };
      });
      setTrackingDrafts(drafts);

      if (profileRes.data) {
        setAdminProfile(profileRes.data);
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('pickle_token');
        router.push('/admin/login');
      } else {
        setErrorMessage(error.response?.data?.message || 'Failed to sync dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('pickle_token');
    router.push('/admin/login');
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchDashboardData();
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  const handleTrackingInput = (orderId, field, value) => {
    setTrackingDrafts((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || { courierPartner: '', trackingId: '' }),
        [field]: value,
      },
    }));
  };

  const handleSaveTracking = async (orderId) => {
    const draft = trackingDrafts[orderId] || { courierPartner: '', trackingId: '' };
    setSavingTrackingId(orderId);
    try {
      await API.put(`/orders/${orderId}/status`, {
        courierPartner: draft.courierPartner,
        trackingId: draft.trackingId,
      });
      await fetchDashboardData();
    } catch (error) {
      alert('Failed to save tracking details');
    } finally {
      setSavingTrackingId(null);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const generatedSlug =
      newProductName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      Date.now();

    try {
      const payload = {
        name: newProductName,
        slug: generatedSlug,
        description: newProductDesc,
        image: newProductImage,
        spiceLevel: newProductSpice,
        variants: [
          {
            weight: '250g',
            originalPrice: Number(origPrice250),
            price: Number(offerPrice250),
            stock: Number(stock250),
          },
          {
            weight: '500g',
            originalPrice: Number(origPrice500),
            price: Number(offerPrice500),
            stock: Number(stock500),
          },
        ],
      };

      await API.post('/products', payload);
      setShowAddModal(false);
      setNewProductName('');
      setNewProductDesc('');
      setNewProductImage('');
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add new pickle variety');
    }
  };

  const openEditModal = (prod) => {
    const v250 = prod.variants?.find((v) => v.weight === '250g') || prod.variants?.[0] || {
      weight: '250g',
      originalPrice: 350,
      price: 299,
      stock: 20,
    };
    const v500 = prod.variants?.find((v) => v.weight === '500g') || prod.variants?.[1] || {
      weight: '500g',
      originalPrice: 650,
      price: 549,
      stock: 20,
    };

    setEditingProduct({
      _id: prod._id,
      name: prod.name,
      description: prod.description,
      image: prod.images?.[0] || '',
      spiceLevel: prod.spiceLevel || 'Medium',
      price250: v250.price,
      orig250: v250.originalPrice || v250.price + 50,
      stock250: v250.stock !== undefined ? v250.stock : 25,
      price500: v500.price,
      orig500: v500.originalPrice || v500.price + 100,
      stock500: v500.stock !== undefined ? v500.stock : 20,
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      await API.put(`/products/${editingProduct._id}`, {
        name: editingProduct.name,
        description: editingProduct.description,
        image: editingProduct.image,
        spiceLevel: editingProduct.spiceLevel,
        variants: [
          {
            weight: '250g',
            originalPrice: Number(editingProduct.orig250),
            price: Number(editingProduct.price250),
            stock: Number(editingProduct.stock250),
          },
          {
            weight: '500g',
            originalPrice: Number(editingProduct.orig500),
            price: Number(editingProduct.price500),
            stock: Number(editingProduct.stock500),
          },
        ],
      });

      setEditingProduct(null);
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this pickle product?')) return;
    try {
      await API.delete(`/products/${productId}`);
      fetchDashboardData();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      await API.post('/coupons', {
        code: couponCode,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount),
      });

      setShowAddCouponModal(false);
      setCouponCode('');
      setDiscountValue('50');
      setMinOrderAmount('299');
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create promo code');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await API.delete(`/coupons/${couponId}`);
      fetchDashboardData();
    } catch (error) {
      alert('Failed to delete coupon');
    }
  };

  // KPI Metrics Calculations
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const pendingDispatchCount = orders.filter(
    (o) => o.status === 'Preparing Batch' || o.status === 'Packed'
  ).length;

  const lowStockCount = products.reduce((count, p) => {
    const lowVariants = (p.variants || []).filter((v) => v.stock !== undefined && v.stock <= 5);
    return count + lowVariants.length;
  }, 0);

  const countByStatus = (status) => orders.filter((o) => o.status === status).length;

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesTab = activeOrderTab === 'All' || o.status === activeOrderTab;
      if (!matchesTab) return false;
      if (!q) return true;

      return (
        o._id?.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q) ||
        o.customer?.phone?.toLowerCase().includes(q) ||
        o.customer?.pincode?.toLowerCase().includes(q) ||
        o.trackingId?.toLowerCase().includes(q)
      );
    });
  }, [orders, activeOrderTab, orderSearch]);

  // Free Client-Side CSV Export for Accounting & GST
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert('No orders to export.');
      return;
    }

    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Phone',
      'Address',
      'Pincode',
      'Items',
      'Items Total (INR)',
      'Discount (INR)',
      'Shipping (INR)',
      'Grand Total (INR)',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Courier Partner',
      'Tracking ID',
      'GSTIN',
    ];

    const rows = filteredOrders.map((o) => [
      o._id,
      o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : '',
      o.customer?.name || '',
      o.customer?.phone || '',
      o.customer?.address || '',
      o.customer?.pincode || '',
      (o.orderItems || []).map((i) => `${i.quantity}x ${i.name} (${i.weight})`).join('; '),
      o.itemsPrice || 0,
      o.discountPrice || 0,
      o.shippingPrice || 0,
      o.totalPrice || 0,
      o.paymentMethod || '',
      o.paymentStatus || '',
      o.status || '',
      o.courierPartner || '',
      o.trackingId || '',
      o.gstinNumber || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `chicken-pickle-orders-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER & ADMIN PROFILE BANNER */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Admin Control Center</h1>
              <p className="text-xs text-gray-500">Manage store orders, stock inventory, courier tracking & coupons</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveView('orders')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeView === 'orders' ? 'bg-white text-red-800 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Orders ({orders.length})
                </button>
                <button
                  onClick={() => setActiveView('products')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeView === 'products' ? 'bg-white text-red-800 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Products ({products.length})
                </button>
                <button
                  onClick={() => setActiveView('coupons')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeView === 'coupons' ? 'bg-white text-red-800 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Coupons ({coupons.length})
                </button>
              </div>

              <button
                onClick={fetchDashboardData}
                className="p-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-xs font-bold"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>

              <Link
                href="/"
                className="p-2 bg-amber-100 text-red-900 rounded-xl hover:bg-amber-200 transition flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeft size={14} />
                <span>Storefront</span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 bg-red-800 text-white rounded-xl hover:bg-red-900 transition flex items-center gap-1.5 text-xs font-bold"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* KPI SUMMARY CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-bold uppercase">Gross Revenue</span>
                <IndianRupee size={15} />
              </div>
              <p className="text-xl sm:text-2xl font-black text-gray-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-emerald-700 font-semibold">Excludes cancelled orders</span>
            </div>

            <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-amber-900 mb-1">
                <span className="text-[11px] font-bold uppercase">Pending Dispatch</span>
                <Flame size={15} />
              </div>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{pendingDispatchCount}</p>
              <span className="text-[10px] text-amber-800 font-semibold">Preparing or Packed</span>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-blue-800 mb-1">
                <span className="text-[11px] font-bold uppercase">Delivered Orders</span>
                <CheckCircle size={15} />
              </div>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{countByStatus('Delivered')}</p>
              <span className="text-[10px] text-blue-700 font-semibold">Completed deliveries</span>
            </div>

            <div
              onClick={() => setActiveView('products')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                lowStockCount > 0
                  ? 'bg-red-50 border-red-200 hover:bg-red-100/70'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between text-red-800 mb-1">
                <span className="text-[11px] font-bold uppercase">Low Stock Alerts</span>
                <AlertTriangle size={15} />
              </div>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{lowStockCount}</p>
              <span className="text-[10px] text-red-700 font-semibold">Variants with ≤ 5 jars</span>
            </div>
          </div>

          {/* ADMIN PROFILE BANNER */}
          {adminProfile && (
            <div
              onClick={() => setShowAdminProfileModal(true)}
              className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-amber-100/60 transition shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-red-800 text-white rounded-xl flex items-center justify-center font-black text-lg group-hover:scale-105 transition">
                  {adminProfile.name ? adminProfile.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm group-hover:text-red-800 transition">
                      {adminProfile.name}
                    </span>
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Shield size={10} /> Super Admin
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Mail size={12} className="text-gray-400" /> {adminProfile.email}
                    </span>
                    {adminProfile.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-gray-400" /> {adminProfile.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right text-xs font-bold text-red-800 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-sm">
                Click to View Profile Details ➔
              </div>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-800 text-xs font-medium">
            <AlertTriangle size={18} className="text-red-600 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* VIEW 1: ORDERS DASHBOARD */}
        {activeView === 'orders' && (
          <div className="space-y-4">
            {/* Search & CSV Export Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search orders by customer name, phone, PIN code, Order ID, or tracking ID..."
                  className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-800"
                />
                {orderSearch && (
                  <button
                    onClick={() => setOrderSearch('')}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                onClick={handleExportCSV}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <Download size={14} />
                <span>Export CSV ({filteredOrders.length})</span>
              </button>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'All', label: 'All Orders', count: orders.length, icon: Boxes },
                { id: 'Preparing Batch', label: 'Preparing', count: countByStatus('Preparing Batch'), icon: Flame },
                { id: 'Packed', label: 'Packed', count: countByStatus('Packed'), icon: Package },
                { id: 'Out for Delivery', label: 'Out for Delivery', count: countByStatus('Out for Delivery'), icon: Truck },
                { id: 'Delivered', label: 'Delivered', count: countByStatus('Delivered'), icon: CheckCircle },
                { id: 'Cancelled', label: 'Cancelled', count: countByStatus('Cancelled'), icon: X },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeOrderTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveOrderTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                      isActive
                        ? 'bg-red-800 text-white border-red-800 shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500 text-sm font-medium">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200 text-gray-500">
                <p className="font-bold text-base text-gray-800 mb-1">No matching orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const draft = trackingDrafts[order._id] || {
                    courierPartner: order.courierPartner || '',
                    trackingId: order.trackingId || '',
                  };

                  return (
                    <div key={order._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col lg:flex-row justify-between gap-6">
                      {/* Customer & Address */}
                      <div className="space-y-2 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                          <span className="font-bold text-gray-900 text-base">{order.customer?.name}</span>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-1.5">
                          <Phone size={14} className="text-gray-400" />
                          {order.customer?.phone}
                        </p>
                        <p className="text-xs text-gray-600 flex items-start gap-1.5">
                          <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                          <span>{order.customer?.address} - <strong>{order.customer?.pincode}</strong></span>
                        </p>
                        {order.gstinNumber && (
                          <p className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">
                            GSTIN: {order.gstinNumber}
                          </p>
                        )}
                      </div>

                      {/* Ordered Items & Totals */}
                      <div className="flex-1 space-y-2 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items Ordered</h4>
                        <div className="space-y-1">
                          {order.orderItems?.map((item, idx) => (
                            <div key={idx} className="text-xs flex justify-between text-gray-800">
                              <span><strong>{item.quantity}x</strong> {item.name} ({item.weight})</span>
                              <span className="font-bold">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs font-black text-red-800 pt-2 border-t border-gray-100 flex justify-between">
                          <span>Total ({order.paymentMethod} • {order.paymentStatus}):</span>
                          <span>₹{order.totalPrice}</span>
                        </div>
                      </div>

                      {/* Status & Courier Tracking Controls */}
                      <div className="flex flex-col justify-between gap-3 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 min-w-[230px]">
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Order Status</label>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="text-xs font-bold p-2.5 border border-gray-300 rounded-xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-800 cursor-pointer w-full"
                          >
                            <option value="Preparing Batch" className="text-black bg-white">Preparing Batch 🌶️</option>
                            <option value="Packed" className="text-black bg-white">Packed 📦</option>
                            <option value="Out for Delivery" className="text-black bg-white">Out for Delivery 🚚</option>
                            <option value="Delivered" className="text-black bg-white">Delivered ✅</option>
                            <option value="Cancelled" className="text-black bg-white">Cancelled ❌</option>
                          </select>
                        </div>

                        {/* Courier Partner & Tracking ID */}
                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 space-y-2">
                          <span className="text-[10px] font-black text-gray-600 uppercase block">
                            Courier & Tracking ID
                          </span>
                          <input
                            type="text"
                            placeholder="Courier (e.g. DTDC / India Post)"
                            value={draft.courierPartner}
                            onChange={(e) => handleTrackingInput(order._id, 'courierPartner', e.target.value)}
                            className="w-full text-[11px] p-2 border border-gray-300 rounded-lg bg-white text-black"
                          />
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Tracking / AWB No."
                              value={draft.trackingId}
                              onChange={(e) => handleTrackingInput(order._id, 'trackingId', e.target.value)}
                              className="flex-1 text-[11px] p-2 border border-gray-300 rounded-lg bg-white text-black font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveTracking(order._id)}
                              disabled={savingTrackingId === order._id}
                              className="bg-gray-900 hover:bg-black text-white text-[11px] font-bold px-2.5 rounded-lg transition disabled:opacity-50"
                            >
                              {savingTrackingId === order._id ? '...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: PRODUCT & INVENTORY MANAGEMENT */}
        {activeView === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Active Store Catalog & Stock</h3>
                <p className="text-xs text-gray-500">Edit pricing or replenish jar stock counts anytime</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-900 transition flex items-center gap-1.5"
              >
                <Plus size={16} />
                <span>Add New Pickle</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => (
                <div key={prod._id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
                  <img src={prod.images?.[0]} alt={prod.name} className="h-36 w-full object-cover rounded-xl" />
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{prod.name}</h4>
                      <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-md font-bold inline-block mt-1">
                        🌶️ {prod.spiceLevel || 'Medium'} Spice
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="text-blue-700 hover:text-blue-900 p-1.5 bg-blue-50 rounded-lg transition"
                        title="Edit Price & Stock"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod._id)}
                        className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 rounded-lg transition"
                        title="Delete Pickle"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{prod.description}</p>
                  
                  <div className="pt-2 border-t border-gray-100 space-y-1.5">
                    {prod.variants?.map((v, i) => {
                      const stockCount = v.stock !== undefined ? v.stock : 25;
                      const isLow = stockCount <= 5;
                      return (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">{v.weight}:</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                stockCount === 0
                                  ? 'bg-red-100 text-red-800'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {stockCount === 0 ? 'Out of Stock' : `${stockCount} jars`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {v.originalPrice && (
                              <span className="text-gray-400 line-through text-[11px]">₹{v.originalPrice}</span>
                            )}
                            <span className="font-black text-red-800">₹{v.price}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: PROMO CODE & COUPON MANAGEMENT */}
        {activeView === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Active Promo Coupons</h3>
                <p className="text-xs text-gray-500">Create discount codes for customer checkout</p>
              </div>
              <button
                onClick={() => setShowAddCouponModal(true)}
                className="bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-900 transition flex items-center gap-1.5"
              >
                <Plus size={16} />
                <span>Create Coupon Code</span>
              </button>
            </div>

            {coupons.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200 text-gray-500">
                <Tag size={36} className="mx-auto text-gray-400 mb-2" />
                <p className="font-bold text-sm text-gray-800">No active coupons created yet</p>
                <p className="text-xs text-gray-500">Click "Create Coupon Code" to offer promo discounts!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div key={c._id} className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm space-y-3 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-emerald-100 text-emerald-800 font-mono font-black text-sm px-3 py-1 rounded-xl border border-emerald-300 inline-block">
                          {c.code}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 block mt-1.5">
                          Min Order: ₹{c.minOrderAmount}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteCoupon(c._id)}
                        className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-medium">Discount Value:</span>
                      <span className="font-black text-red-800 text-sm">
                        {c.discountType === 'FLAT' ? `₹${c.discountValue} OFF` : `${c.discountValue}% OFF`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADD PRODUCT MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
              <h3 className="text-lg font-black text-gray-900">Add New Pickle Variety</h3>
              <form onSubmit={handleAddProduct} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Pickle Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gongura Chicken Pickle"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                  <textarea
                    required
                    rows="2"
                    placeholder="Rich tangy sorrel leaves blended with boneless chicken..."
                    value={newProductDesc}
                    onChange={(e) => setNewProductDesc(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Image URL</label>
                    <input
                      type="text"
                      required
                      placeholder="https://..."
                      value={newProductImage}
                      onChange={(e) => setNewProductImage(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Spice Level</label>
                    <select
                      value={newProductSpice}
                      onChange={(e) => setNewProductSpice(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white font-bold"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Medium">Medium</option>
                      <option value="Spicy">Spicy</option>
                      <option value="Extra Fiery">Extra Fiery</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">250g Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={offerPrice250}
                      onChange={(e) => setOfferPrice250(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">250g Stock (Jars)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={stock250}
                      onChange={(e) => setStock250(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">500g Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={offerPrice500}
                      onChange={(e) => setOfferPrice500(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">500g Stock (Jars)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={stock500}
                      onChange={(e) => setStock500(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-2.5 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-red-800 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-red-900"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT PRODUCT & STOCK MODAL */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900">Edit Pickle & Stock</h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Pickle Name</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                  <textarea
                    required
                    rows="2"
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Image URL</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.image}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Spice Level</label>
                    <select
                      value={editingProduct.spiceLevel}
                      onChange={(e) => setEditingProduct({ ...editingProduct, spiceLevel: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white font-bold"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Medium">Medium</option>
                      <option value="Spicy">Spicy</option>
                      <option value="Extra Fiery">Extra Fiery</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">250g Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price250}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price250: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">250g Stock (Jars)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editingProduct.stock250}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock250: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">500g Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price500}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price500: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">500g Stock (Jars)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editingProduct.stock500}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock500: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white font-bold"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-2.5 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-red-800 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-red-900"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE COUPON MODAL */}
        {showAddCouponModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Tag className="text-red-800" size={20} />
                <h3 className="text-lg font-black text-gray-900">Create New Coupon</h3>
              </div>

              <form onSubmit={handleAddCoupon} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SPICY50"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white uppercase font-mono tracking-wider"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="w-full text-xs font-bold p-2.5 border border-gray-300 rounded-xl text-black bg-white"
                    >
                      <option value="FLAT">Flat ₹ OFF</option>
                      <option value="PERCENTAGE">Percentage % OFF</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Discount Amount</label>
                    <input
                      type="number"
                      required
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Minimum Order Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-xl text-black bg-white font-medium"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCouponModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-2.5 rounded-xl hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-red-800 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-red-900"
                  >
                    Save Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADMIN PROFILE DETAILS MODAL */}
        {showAdminProfileModal && adminProfile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-gray-200 relative">
              <button
                onClick={() => setShowAdminProfileModal(false)}
                className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full"
              >
                <X size={16} />
              </button>

              <div className="text-center pt-2">
                <div className="w-16 h-16 bg-red-800 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 font-black text-2xl shadow-md">
                  {adminProfile.name ? adminProfile.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <h3 className="text-xl font-black text-gray-900">{adminProfile.name}</h3>
                <span className="text-xs font-bold text-red-800 bg-red-100 px-3 py-1 rounded-full inline-block mt-1">
                  Full Store Administrator 🛡️
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl space-y-3 text-xs border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Mail size={14} className="text-red-800" /> Admin Email:
                  </span>
                  <span className="font-bold text-gray-900">{adminProfile.email}</span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Phone size={14} className="text-red-800" /> Phone Contact:
                  </span>
                  <span className="font-bold text-gray-900">{adminProfile.phone || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Shield size={14} className="text-red-800" /> Access Privileges:
                  </span>
                  <span className="font-bold text-green-700">Orders, Products, Stock & Status Control</span>
                </div>
              </div>

              <button
                onClick={() => setShowAdminProfileModal(false)}
                className="w-full bg-red-800 text-white font-bold py-3 rounded-xl hover:bg-red-900 transition text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}