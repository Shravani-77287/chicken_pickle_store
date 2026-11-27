// frontend/app/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Star,
  Flame,
  Check,
  Truck,
  User,
  X,
  MapPin,
  Phone,
  Mail,
  LogIn,
  LogOut,
  Search,
} from 'lucide-react';
import API from '../lib/api';
import { useCart } from '../context/CartContext';
import CartDrawer from '../components/CartDrawer';

const SPICE_LEVELS = ['All', 'Mild', 'Medium', 'Spicy', 'Extra Fiery'];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [customerUser, setCustomerUser] = useState(null);

  // Search, Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [spiceFilter, setSpiceFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const { totalItems, setIsCartOpen, addToCart } = useCart();

  useEffect(() => {
    const savedUser = localStorage.getItem('customer_user');
    if (savedUser) {
      try {
        setCustomerUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('customer_user');
      }
    }

    const fetchProducts = async () => {
      try {
        const response = await API.get('/products');
        setProducts(response.data);

        const initialVariants = {};
        response.data.forEach((p) => {
          if (p.variants && p.variants.length > 0) {
            initialVariants[p._id] = p.variants[0];
          }
        });
        setSelectedVariants(initialVariants);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCustomerLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    window.dispatchEvent(new Event('auth-change'));
    setCustomerUser(null);
    setShowProfileModal(false);
  };

  const handleVariantSelect = (productId, variant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variant,
    }));
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSpice =
        spiceFilter === 'All' ||
        (product.spiceLevel || 'Medium').toLowerCase() === spiceFilter.toLowerCase();

      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.ingredients?.toLowerCase().includes(query);

      return matchesSpice && matchesSearch;
    });

    if (sortBy === 'price-asc') {
      return [...filtered].sort(
        (a, b) => (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0)
      );
    }

    if (sortBy === 'price-desc') {
      return [...filtered].sort(
        (a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0)
      );
    }

    return filtered;
  }, [products, searchQuery, spiceFilter, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSpiceFilter('All');
    setSortBy('newest');
  };

  return (
    <main className="min-h-screen bg-amber-50 text-gray-900 pb-16">
      <CartDrawer />

      {/* Top Banner */}
      <div className="bg-red-800 text-amber-100 text-center text-xs sm:text-sm py-2 px-4 font-medium">
        🌶️ Free Delivery on all Orders Above ₹499 | Authentic Homestyle Taste
      </div>

      {/* Navigation Header */}
      <header className="bg-white border-b border-amber-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-3">
          <Link href="/" className="text-xl sm:text-2xl font-black text-red-800 tracking-wide">
            CHICKEN PICKLE STORE
          </Link>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/admin"
              className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full transition border border-gray-200"
            >
              Owner Portal
            </Link>

            {customerUser ? (
              <>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full transition flex items-center gap-1.5"
                >
                  <User size={15} className="text-red-800" />
                  <span>{customerUser.name}</span>
                </button>

                <Link
                href="/orders"
                onClick={() => setShowProfileModal(false)}
                className="flex-1 bg-red-800 text-white font-bold py-2.5 rounded-xl hover:bg-red-900 transition text-xs flex items-center justify-center gap-1.5"
              >
                <Truck size={15} />
                <span>My Orders</span>
              </Link>

                <button
                  onClick={handleCustomerLogout}
                  className="text-xs font-bold text-red-800 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-full transition flex items-center gap-1.5 border border-red-200"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-xs font-bold text-white bg-red-800 hover:bg-red-900 px-3.5 py-2 rounded-full transition flex items-center gap-1.5"
              >
                <LogIn size={14} />
                <span>Login / Register</span>
              </Link>
            )}

            <Link
              href="/track"
              className="text-xs font-bold text-red-900 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-full transition flex items-center gap-1.5"
            >
              <Truck size={14} />
              <span>Track Order</span>
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-amber-100 text-red-900 px-4 py-2 rounded-full font-bold text-sm hover:bg-amber-200 transition relative"
            >
              <ShoppingBag size={18} />
              <span suppressHydrationWarning>Cart ({totalItems})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6 text-center">
        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full mb-4">
          <Flame size={14} className="text-red-600" /> 100% Preservative Free
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-3 leading-tight">
          Fiery, Homestyle <span className="text-red-800">Chicken Pickles</span>
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base">
          Slow-cooked with premium boneless chicken, cold-pressed oils, and secret family spices. Fresh batches made daily.
        </p>
      </section>

      {/* Search, Spice Filter & Sort Controls */}
      <section className="max-w-6xl mx-auto px-4 mb-8 space-y-4">
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pickles (e.g., Boneless, Gongura, Garlic)..."
              className="w-full pl-10 pr-8 py-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold p-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-800 cursor-pointer"
            >
              <option value="newest">Latest Batches</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Spice Level Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-gray-600 shrink-0 mr-1">Spice Level:</span>
          {SPICE_LEVELS.map((level) => {
            const isActive = spiceFilter === level;
            return (
              <button
                key={level}
                onClick={() => setSpiceFilter(level)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap border ${
                  isActive
                    ? 'bg-red-800 text-white border-red-800 shadow-sm'
                    : 'bg-white text-gray-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                {level === 'All' ? 'All Varieties' : `🌶️ ${level}`}
              </button>
            );
          })}
        </div>
      </section>

      {/* Product Catalog */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Our Fresh Batches ({filteredProducts.length})
          </h3>
          {(searchQuery || spiceFilter !== 'All' || sortBy !== 'newest') && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-red-800 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading delicious pickles...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-amber-200 space-y-3">
            <p className="text-sm font-bold text-gray-800">
              No pickles matched your search or spice filter.
            </p>
            <button
              onClick={resetFilters}
              className="bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-red-900 transition"
            >
              Show All Pickles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const currentVariant = selectedVariants[product._id] || product.variants?.[0];
              const offerPrice = currentVariant?.price || 0;
              const originalPrice = currentVariant?.originalPrice || offerPrice + 50;
              const discountPercent =
                offerPrice > 0
                  ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
                  : 0;

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <Link href={`/product/${product.slug || product._id}`} className="block">
                      <div className="h-48 bg-gray-200 relative overflow-hidden">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        />
                        <span className="absolute top-3 left-3 bg-red-800 text-white text-xs px-2 py-1 rounded-md font-semibold">
                          🌶️ {product.spiceLevel || 'Medium'} Spice
                        </span>

                        <span className="absolute top-3 right-3 bg-green-600 text-white text-xs px-2 py-1 rounded-md font-black">
                          {discountPercent}% OFF
                        </span>
                      </div>
                    </Link>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star size={14} fill="currentColor" />
                        <span>
                          {product.rating > 0 ? product.rating : '4.8'} ({product.numReviews || 12} reviews)
                        </span>
                      </div>

                      <Link
                        href={`/product/${product.slug || product._id}`}
                        className="block hover:text-red-800 transition"
                      >
                        <h4 className="font-bold text-lg text-gray-900">{product.name}</h4>
                      </Link>
                      <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>

                      <div>
                        <span className="text-xs font-semibold text-gray-600 mb-1.5 block">
                          Select Jar Size:
                        </span>
                        <div className="flex gap-2">
                          {product.variants?.map((variant) => {
                            const isSelected = currentVariant?.weight === variant.weight;
                            return (
                              <button
                                key={variant.weight}
                                onClick={() => handleVariantSelect(product._id, variant)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                  isSelected
                                    ? 'bg-red-800 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {isSelected && <Check size={12} />}
                                <span>{variant.weight}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <div>
                        <span className="text-xs text-gray-400 block">
                          Price ({currentVariant?.weight})
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-gray-400 line-through font-bold">
                            ₹{originalPrice}
                          </span>
                          <span className="text-xl font-black text-red-800">₹{offerPrice}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => addToCart(product, currentVariant)}
                        className="bg-red-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-900 transition flex items-center gap-1.5 shadow-sm"
                      >
                        <ShoppingBag size={15} />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Logged-In Customer Profile Modal */}
      {showProfileModal && customerUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-amber-200 relative">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full"
            >
              <X size={16} />
            </button>

            <div className="text-center pt-2">
              <div className="w-16 h-16 bg-red-100 text-red-800 rounded-full flex items-center justify-center mx-auto mb-3 font-black text-2xl">
                {customerUser.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-lg font-black text-gray-900">{customerUser.name}</h3>
              <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full inline-block mt-1">
                Verified Customer Account
              </span>
            </div>

            <div className="space-y-3 bg-amber-50/60 p-4 rounded-2xl text-xs">
              <div className="flex items-center gap-2.5 text-gray-700">
                <Mail size={16} className="text-red-800 shrink-0" />
                <span className="font-semibold">{customerUser.email}</span>
              </div>
              {customerUser.phone && (
                <div className="flex items-center gap-2.5 text-gray-700">
                  <Phone size={16} className="text-red-800 shrink-0" />
                  <span className="font-semibold">{customerUser.phone}</span>
                </div>
              )}
              <div className="flex items-start gap-2.5 text-gray-700">
                <MapPin size={16} className="text-red-800 shrink-0 mt-0.5" />
                <span>
                  Default Delivery Area:
                  <br />
                  <strong className="text-gray-900">Hyderabad, Telangana</strong>
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href="/track"
                onClick={() => setShowProfileModal(false)}
                className="flex-1 bg-red-800 text-white font-bold py-2.5 rounded-xl hover:bg-red-900 transition text-xs flex items-center justify-center gap-1.5"
              >
                <Truck size={15} />
                <span>My Orders</span>
              </Link>

              <button
                onClick={handleCustomerLogout}
                className="px-4 bg-gray-100 text-red-800 font-bold py-2.5 rounded-xl hover:bg-gray-200 transition text-xs flex items-center justify-center gap-1.5"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}