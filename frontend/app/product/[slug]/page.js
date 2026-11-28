// frontend/app/product/[slug]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import API from '../../../lib/api';
import { useCart } from '../../../context/CartContext';
import CartDrawer from '../../../components/CartDrawer';
import {
  ArrowLeft,
  ShoppingBag,
  Star,
  Flame,
  Check,
  ShieldCheck,
  Clock,
  Info,
  AlertTriangle,
  Truck,
  Share2,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewError, setReviewError] = useState('');

  const { totalItems, setIsCartOpen, addToCart } = useCart();

  const fetchProductAndReviews = async () => {
    try {
      const res = await API.get(`/products/${slug}`);
      setProduct(res.data);
      if (res.data.variants?.length > 0) {
        setSelectedVariant((prev) => prev || res.data.variants[0]);
      }

      const reviewsRes = await API.get(`/reviews/${res.data._id}`).catch(() => ({ data: [] }));
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem('customer_token')));
    if (!slug) return;
    fetchProductAndReviews();
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!product?._id || !comment.trim()) return;

    setSubmittingReview(true);
    setReviewError('');
    setReviewMessage('');

    try {
      await API.post(`/reviews/${product._id}`, {
        rating,
        comment,
      });
      setComment('');
      setReviewMessage('Thank you! Your review has been published.');
      await fetchProductAndReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center text-sm font-bold text-gray-600">
        Loading pickle details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4 space-y-4">
        <p className="text-lg font-black text-gray-900">Pickle variety not found</p>
        <Link href="/" className="bg-red-800 text-white text-xs font-bold px-5 py-2.5 rounded-full">
          Go Back to Store
        </Link>
      </div>
    );
  }

  const offerPrice = selectedVariant?.price || 0;
  const originalPrice = selectedVariant?.originalPrice || offerPrice + 50;
  const discountPercent =
    offerPrice > 0 ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100) : 0;

  return (
    <main className="min-h-screen bg-amber-50 text-gray-900 pb-16">
      <CartDrawer />

      {/* Top Navigation */}
      <header className="bg-white border-b border-amber-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-red-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-full transition"
          >
            <ArrowLeft size={15} />
            <span>Go Back to Store</span>
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-amber-100 text-red-900 px-4 py-2 rounded-full font-bold text-sm hover:bg-amber-200 transition"
          >
            <ShoppingBag size={18} />
            <span suppressHydrationWarning>Cart ({totalItems})</span>
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-8 space-y-8">
        {/* Main Product Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Column */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-72 sm:h-96">
            <img
              src={product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 left-3 bg-red-800 text-white text-xs px-3 py-1 rounded-lg font-bold flex items-center gap-1">
              <Flame size={13} /> {product.spiceLevel || 'Medium'} Spice
            </span>
            <span className="absolute top-3 right-3 bg-green-600 text-white text-xs px-3 py-1 rounded-lg font-black">
              {discountPercent}% OFF
            </span>
          </div>

          {/* Info & Variant Selection Column */}
          <div className="flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    title="Non-Vegetarian Product"
                    className="w-5 h-5 border-2 border-red-700 flex items-center justify-center rounded-sm bg-white"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-700 block" />
                  </span>
                  <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider">
                    100% Homestyle Non-Veg
                  </span>
                </div>

                <button
                  onClick={handleShare}
                  className="text-xs font-bold text-gray-600 hover:text-red-800 flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full transition"
                >
                  <Share2 size={13} />
                  <span>{copied ? 'Link Copied!' : 'Share'}</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{product.name}</h1>

              <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                <Star size={15} fill="currentColor" />
                <span>
                  {product.rating || 4.8} ({reviews.length > 0 ? reviews.length : product.numReviews || 12} ratings)
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>

              {/* Weight Variant Selector */}
              <div className="pt-2">
                <span className="text-xs font-bold text-gray-700 block mb-2">
                  Select Net Weight:
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants?.map((variant) => {
                    const isSelected = selectedVariant?.weight === variant.weight;
                    return (
                      <button
                        key={variant.weight}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-red-800 text-white border-red-800 shadow-sm'
                            : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {isSelected && <Check size={14} />}
                        <span>{variant.weight} Jar</span>
                        <span className={isSelected ? 'text-amber-200' : 'text-red-800'}>
                          • ₹{variant.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Price & Add to Cart */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] text-gray-500 block">
                    MRP (Inclusive of all taxes)
                  </span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-black text-red-800">₹{offerPrice}</span>
                    <span className="text-sm text-gray-400 line-through font-bold">
                      ₹{originalPrice}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    selectedVariant?.stock !== undefined && selectedVariant.stock <= 0
                      ? 'text-red-700 bg-red-50 border-red-200'
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  }`}
                >
                  {selectedVariant?.stock !== undefined && selectedVariant.stock <= 0
                    ? 'Out of Stock'
                    : 'Fresh Batch Available'}
                </span>
              </div>

              {selectedVariant?.stock !== undefined && selectedVariant.stock <= 0 ? (
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-500 font-black py-3.5 rounded-2xl text-sm cursor-not-allowed"
                >
                  Currently Out of Stock
                </button>
              ) : (
                <button
                  onClick={() => addToCart(product, selectedVariant)}
                  className="w-full bg-red-800 hover:bg-red-900 text-white font-black py-3.5 rounded-2xl text-sm transition flex items-center justify-center gap-2 shadow-md"
                >
                  <ShoppingBag size={18} />
                  <span>Add {selectedVariant?.weight} Jar to Cart — ₹{offerPrice}</span>
                </button>
              )}

              <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                <Truck size={14} className="text-emerald-600 shrink-0" />
                <span>Free delivery on orders ₹499+ | Dispatched within 24 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Food Quality, Ingredients & FSSAI Labelling Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-amber-200 space-y-2">
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <Info size={16} className="text-red-800" /> Ingredients & Nutrition
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">{product.ingredients}</p>
            <p className="text-[11px] text-gray-500 pt-2 border-t border-gray-100 font-medium">
              {product.nutritionalInfo}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-amber-200 space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <Clock size={16} className="text-red-800" /> Batch Freshness & Shelf Life
              </h3>

              {/* FSSAI Batch, MFG & Expiry Pill Row */}
              <div className="grid grid-cols-3 gap-2 py-2">
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Batch No.</span>
                  <span className="text-[11px] font-mono font-black text-gray-900">
                    {product.batchCode || 'BATCH-2026-A'}
                  </span>
                </div>
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Packed On</span>
                  <span className="text-[11px] font-black text-gray-900">
                    {product.mfgDate
                      ? new Date(product.mfgDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Fresh Batch'}
                  </span>
                </div>
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Best Before</span>
                  <span className="text-[11px] font-black text-emerald-900">
                    {product.expiryDate
                      ? new Date(product.expiryDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '4 Months'}
                  </span>
                </div>
              </div>

              <p className="text-xs font-bold text-gray-800">{product.shelfLife}</p>
              <p className="text-xs text-gray-600">{product.storageInstructions}</p>
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-1">
              <p className="text-[11px] text-amber-800 font-bold flex items-center gap-1.5">
                <AlertTriangle size={13} /> Allergen Advice:
              </p>
              <p className="text-[11px] text-gray-600">{product.allergens}</p>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-[11px] font-bold text-gray-700">
              <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
              <span>FSSAI License: {product.fssaiNumber}</span>
            </div>
          </div>
        </div>

        {/* Customer Ratings & Reviews Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <MessageSquare size={18} className="text-red-800" /> Customer Reviews ({reviews.length})
              </h3>
              <p className="text-xs text-gray-500">Honest feedback from pickle lovers</p>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-2xl">
              <Star size={16} className="text-amber-500" fill="currentColor" />
              <span className="text-sm font-black text-gray-900">{product.rating || 4.8} / 5</span>
            </div>
          </div>

          {/* Write a Review Form */}
          {isLoggedIn ? (
            <form onSubmit={handleReviewSubmit} className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
              <span className="text-xs font-black text-gray-900 block">Rate & Review this Pickle</span>

              {reviewError && (
                <p className="text-xs font-bold text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  {reviewError}
                </p>
              )}
              {reviewMessage && (
                <p className="text-xs font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  {reviewMessage}
                </p>
              )}

              {/* 1-5 Star Picker */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    className="p-1 transition hover:scale-110"
                  >
                    <Star
                      size={22}
                      className={starValue <= rating ? 'text-amber-500' : 'text-gray-300'}
                      fill={starValue <= rating ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-gray-600 ml-2">{rating} out of 5</span>
              </div>

              <textarea
                rows="2"
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the spice level, chicken tenderness, and oil aroma?"
                className="w-full p-3 text-xs bg-white border border-amber-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-800"
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="bg-red-800 hover:bg-red-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-gray-700">
                Ordered this pickle? Sign in to share your rating and review.
              </span>
              <Link
                href="/login"
                className="bg-red-800 text-white font-bold px-4 py-2 rounded-xl hover:bg-red-900 transition"
              >
                Sign In to Review
              </Link>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">
              No written reviews yet. Be the first to review this batch!
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-900">{rev.userName}</span>
                      {rev.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={11} /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        fill={s <= rev.rating ? 'currentColor' : 'none'}
                        className={s <= rev.rating ? 'text-amber-500' : 'text-gray-300'}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed pt-0.5">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}