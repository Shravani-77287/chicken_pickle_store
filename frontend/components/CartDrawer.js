// frontend/components/CartDrawer.js
'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import API from '../lib/api';
import { useRouter } from 'next/navigation';
import {
  X,
  FileText,
  Truck,
  Package,
  ChevronRight,
  ChevronUp,
  Mic,
  DoorOpen,
  ShieldCheck,
  BellOff,
  Bell,
  MapPin,
  CheckCircle2,
  Loader2,
  Check,
  Tag,
} from 'lucide-react';

function CartDrawer() {
  const { cartItems = [], isCartOpen, setIsCartOpen, updateQuantity, clearCart } = useCart();
  const router = useRouter();

  const items = cartItems || [];

  const [selectedInstruction, setSelectedInstruction] = useState('door');
  const [showGstinInput, setShowGstinInput] = useState(false);
  const [gstin, setGstin] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PhonePe UPI');
  const [showPaymentMenu, setShowPaymentMenu] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [customer, setCustomer] = useState({
    name: 'Shravani',
    phone: '9876543210',
    address: 'Malla Reddy Engineering College for Women, Maisammaguda',
    pincode: '500100',
  });

  if (!isCartOpen) return null;

  const handlingCharge = items.length > 0 ? 12 : 0;

  const itemsTotal = items.reduce(
    (acc, item) => acc + (item.selectedVariant?.price || 0) * item.quantity,
    0
  );

  const itemsOriginalTotal = items.reduce((acc, item) => {
    const origPrice =
      item.selectedVariant?.originalPrice || (item.selectedVariant?.price || 0) + 50;
    return acc + origPrice * item.quantity;
  }, 0);

  const itemSavings = itemsOriginalTotal - itemsTotal;

  const isFreeDelivery = itemsTotal >= 499 || items.length === 0;
  const deliveryCharge = isFreeDelivery ? 0 : 30;
  const deliverySavings = isFreeDelivery && items.length > 0 ? 30 : 0;

  // Coupon Discount Calculations
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, itemsTotal - couponDiscount + deliveryCharge + handlingCharge);
  const totalSavings = itemSavings + deliverySavings + couponDiscount;

  // Apply Coupon Handler
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await API.post('/coupons/apply', {
        code: couponCode,
        itemsTotal,
      });
      setAppliedCoupon(res.data);
      setCouponError('');
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove Coupon Handler
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);

    try {
      const orderPayload = {
        customer,
        orderItems: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.selectedVariant?.price || 0,
          weight: item.selectedVariant?.weight || 'Standard',
          product: item._id,
        })),
        itemsPrice: itemsTotal,
        discountPrice: couponDiscount,
        shippingPrice: deliveryCharge,
        totalPrice: grandTotal,
        paymentMethod,
        deliveryInstruction: selectedInstruction,
        gstinNumber: gstin,
        couponCode: appliedCoupon ? appliedCoupon.code : '',
      };

      await API.post('/orders', orderPayload);
      setOrderSuccess(true);
      clearCart();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deliveryInstructions = [
    { id: 'record', title: 'Record voice', desc: 'Tap here and hold', icon: Mic },
    { id: 'door', title: 'Leave at door', desc: 'Drop at doorstep', icon: DoorOpen },
    { id: 'guard', title: 'Leave with guard', desc: 'Security desk', icon: ShieldCheck },
    { id: 'ring', title: 'Ring doorbell', desc: 'Press main bell', icon: Bell },
    { id: 'silent', title: 'Avoid calling', desc: 'Do not ring bell', icon: BellOff },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#121212] text-white h-full flex flex-col justify-between overflow-hidden shadow-2xl border-l border-gray-800">
        
        {/* Header */}
        <div className="p-4 bg-[#1e1e1e] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-emerald-400" />
            <h2 className="font-extrabold text-base tracking-wide text-white">Your Cart ({items.length})</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {orderSuccess ? (
          <div className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 size={64} className="text-emerald-500 animate-bounce" />
            <h3 className="text-2xl font-black text-white">Order Placed Successfully!</h3>
            <p className="text-xs text-gray-400 max-w-xs">
              We have received your order for fresh homestyle chicken pickle. WhatsApp notification sent to{' '}
              <span className="text-emerald-400 font-bold">{customer.phone}</span>.
            </p>
            <button
              onClick={() => {
                setOrderSuccess(false);
                setIsCartOpen(false);
                router.push('/track');
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl text-xs tracking-wider transition shadow-lg mt-4"
            >
              Track Order Live 🚚
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 p-8 text-center flex flex-col items-center justify-center space-y-3">
            <Package size={56} className="text-gray-600" />
            <h3 className="text-lg font-bold text-gray-300">Your cart is empty</h3>
            <p className="text-xs text-gray-500">Add some delicious spicy pickles to get started!</p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="mt-4 bg-red-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800">
            
            {/* Cart Items */}
            <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-gray-800 space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordered Items</h3>
              {items.map((item) => (
                <div key={`${item._id}-${item.selectedVariant?.weight}`} className="flex items-center justify-between text-xs py-2 border-b border-gray-800/80 last:border-none">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white text-sm">{item.name}</p>
                    <p className="text-gray-400 text-[11px]">{item.selectedVariant?.weight} Jar</p>
                    <p className="font-black text-emerald-400">₹{item.selectedVariant?.price}</p>
                  </div>

                  <div className="flex items-center gap-2 bg-[#2a2a2a] px-3 py-1.5 rounded-xl border border-gray-700">
                    <button
                      onClick={() => updateQuantity(item._id, item.selectedVariant?.weight, item.quantity - 1)}
                      className="text-gray-300 hover:text-white font-bold"
                    >
                      -
                    </button>
                    <span className="font-black text-white px-1.5">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.selectedVariant?.weight, item.quantity + 1)}
                      className="text-gray-300 hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo / Coupon Code Input Section */}
            <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Tag size={14} className="text-amber-400" /> Apply Coupon Code
                </h4>
              </div>

              {appliedCoupon ? (
                <div className="bg-emerald-950/80 border border-emerald-700/80 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-black text-emerald-400">{appliedCoupon.code} Applied ✅</p>
                    <p className="text-[10px] text-emerald-200">You saved ₹{appliedCoupon.discountAmount} on this order!</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 bg-black/40 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Code (e.g. SPICY50)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 text-xs p-2.5 rounded-xl bg-[#2a2a2a] border border-gray-700 text-white uppercase placeholder-gray-500 font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 rounded-xl transition disabled:opacity-50"
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[11px] text-red-400 font-medium pt-1">{couponError}</p>
              )}
            </div>

            {/* Bill Details */}
            <div className="bg-[#1e1e1e] p-5 rounded-2xl border border-gray-800 space-y-3">
              <h3 className="text-lg font-extrabold text-white">Bill details</h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-gray-300">
                    <FileText size={14} className="text-gray-400" />
                    <span className="border-b border-dashed border-gray-600">Items total</span>
                    {itemSavings > 0 && (
                      <span className="bg-blue-900/80 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-md ml-1">
                        Saved ₹{itemSavings}
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2 font-bold">
                    <span className="line-through text-gray-500">₹{itemsOriginalTotal}</span>
                    <span className="text-white">₹{itemsTotal}</span>
                  </div>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between items-center text-emerald-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Tag size={14} />
                      <span className="border-b border-dashed border-emerald-600">Coupon Discount ({appliedCoupon.code})</span>
                    </span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-gray-300">
                    <Truck size={14} className="text-gray-400" />
                    <span className="border-b border-dashed border-gray-600">Delivery charge</span>
                  </span>
                  <div className="flex items-center gap-2 font-bold">
                    <span className="line-through text-gray-500">₹30</span>
                    <span className="text-blue-400 font-extrabold">
                      {isFreeDelivery ? 'FREE' : '₹30'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-gray-300">
                    <Package size={14} className="text-gray-400" />
                    <span className="border-b border-dashed border-gray-600">Handling charge</span>
                  </span>
                  <span className="font-bold text-white">₹{handlingCharge}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-gray-700 flex justify-between items-center text-base font-black">
                <span className="border-b border-dashed border-gray-500 text-white">Grand total</span>
                <span className="text-white text-lg">₹{grandTotal}</span>
              </div>

              {totalSavings > 0 && (
                <div className="bg-[#1e3a8a]/90 text-blue-100 p-3.5 rounded-xl border border-blue-700/60 flex justify-between items-center mt-3">
                  <div>
                    <p className="font-black text-sm text-white">Your total savings</p>
                    <p className="text-[11px] text-blue-200">
                      Includes ₹{deliverySavings + couponDiscount} savings through free delivery & coupons
                    </p>
                  </div>
                  <span className="font-black text-lg text-white">₹{totalSavings}</span>
                </div>
              )}
            </div>

            {/* Add GSTIN */}
            <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-gray-800 space-y-2">
              <button
                onClick={() => setShowGstinInput(!showGstinInput)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">Add GSTIN</h4>
                  <p className="text-xs text-gray-400">Claim GST input credit up to 18% on your order</p>
                </div>
                <ChevronRight
                  size={18}
                  className={`text-gray-400 transition-transform ${showGstinInput ? 'rotate-90' : ''}`}
                />
              </button>

              {showGstinInput && (
                <div className="pt-2 animate-in fade-in">
                  <input
                    type="text"
                    placeholder="Enter 15-digit GSTIN (e.g., 36AAAAA0000A1Z5)"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full text-xs p-2.5 rounded-xl bg-[#2a2a2a] border border-gray-700 text-white placeholder-gray-500 font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Delivery Instructions */}
            <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-gray-800 space-y-3">
              <h3 className="text-sm font-extrabold text-white">Delivery instructions</h3>

              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {deliveryInstructions.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedInstruction === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedInstruction(item.id)}
                      className={`min-w-[120px] max-w-[130px] p-3 rounded-2xl border text-left transition flex flex-col justify-between shrink-0 h-28 relative ${
                        isSelected
                          ? 'bg-[#282828] border-emerald-500 shadow-md'
                          : 'bg-[#242424] border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <Icon size={18} className={isSelected ? 'text-emerald-400' : 'text-gray-400'} />
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-gray-600 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check size={10} className="text-black stroke-[3]" />}
                        </div>
                      </div>

                      <div>
                        <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                          {item.title}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-[#1e1e1e] p-4 rounded-2xl border border-gray-800 flex items-center justify-between">
              <div className="flex items-start gap-2.5 overflow-hidden">
                <MapPin size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white">Delivering to <span className="text-emerald-400">Home</span></p>
                  <p className="text-[11px] text-gray-400 truncate">{customer.address}</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddressModal(true)}
                className="text-xs font-extrabold text-emerald-400 hover:underline shrink-0 ml-2"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {!orderSuccess && items.length > 0 && (
          <div className="bg-[#181818] p-4 border-t border-gray-800 space-y-3">
            <div className="flex justify-between items-center text-xs px-1">
              <button
                onClick={() => setShowPaymentMenu(!showPaymentMenu)}
                className="flex items-center gap-1.5 text-white font-bold hover:text-emerald-400 transition"
              >
                <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center text-[10px] font-black">
                  pe
                </div>
                <span>PAY USING</span>
                <ChevronUp size={14} className={`transition-transform ${showPaymentMenu ? 'rotate-180' : ''}`} />
              </button>

              <span className="font-extrabold text-emerald-400">{paymentMethod}</span>
            </div>

            {showPaymentMenu && (
              <div className="bg-[#242424] p-3 rounded-xl border border-gray-700 space-y-2 text-xs animate-in slide-in-from-bottom-2">
                {['PhonePe UPI', 'Google Pay / Paytm', 'Cash on Delivery (COD)'].map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      setPaymentMethod(method);
                      setShowPaymentMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg font-bold flex justify-between items-center ${
                      paymentMethod === method ? 'bg-emerald-950 text-emerald-300' : 'text-gray-300 hover:bg-[#2e2e2e]'
                    }`}
                  >
                    <span>{method}</span>
                    {paymentMethod === method && <Check size={14} className="text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black py-3.5 px-5 rounded-2xl flex items-center justify-between transition shadow-lg disabled:opacity-50"
            >
              <div className="text-left leading-tight">
                <span className="text-base block">₹{grandTotal}</span>
                <span className="text-[10px] uppercase font-bold text-black/80 tracking-wider">TOTAL</span>
              </div>

              <div className="flex items-center gap-1 text-base tracking-wide">
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Placing...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order</span>
                    <ChevronRight size={20} className="stroke-[3]" />
                  </>
                )}
              </div>
            </button>
          </div>
        )}

        {showAddressModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-[#1e1e1e] p-6 rounded-3xl max-w-sm w-full space-y-4 border border-gray-800 text-white">
              <h3 className="font-black text-lg">Update Delivery Address</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#2a2a2a] border border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#2a2a2a] border border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Delivery Address</label>
                  <textarea
                    rows="2"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#2a2a2a] border border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Pincode</label>
                  <input
                    type="text"
                    value={customer.pincode}
                    onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#2a2a2a] border border-gray-700 text-white"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowAddressModal(false)}
                className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-emerald-700"
              >
                Save & Continue
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default CartDrawer;