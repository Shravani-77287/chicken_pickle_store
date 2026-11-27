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
} from 'lucide-react';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const { totalItems, setIsCartOpen, addToCart } = useCart();

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${slug}`);
        setProduct(res.data);
        if (res.data.variants?.length > 0) {
          setSelectedVariant(res.data.variants[0]);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
              {/* FSSAI Non-Veg Symbol + Rating + Share */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {/* Mandatory Indian Non-Vegetarian Mark */}
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
                  {product.rating || 4.8} ({product.numReviews || 12} verified ratings)
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

                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Fresh Batch Available
                </span>
              </div>

              <button
                onClick={() => addToCart(product, selectedVariant)}
                className="w-full bg-red-800 hover:bg-red-900 text-white font-black py-3.5 rounded-2xl text-sm transition flex items-center justify-center gap-2 shadow-md"
              >
                <ShoppingBag size={18} />
                <span>Add {selectedVariant?.weight} Jar to Cart — ₹{offerPrice}</span>
              </button>

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
                <Clock size={16} className="text-red-800" /> Shelf Life & Storage
              </h3>
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
      </div>
    </main>
  );
}