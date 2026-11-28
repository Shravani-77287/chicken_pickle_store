// frontend/app/support/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  ChevronDown,
  Truck,
  ShieldCheck,
  Clock,
} from 'lucide-react';

const FAQS = [
  {
    q: 'How long do your chicken pickles stay fresh without preservatives?',
    a: 'Our pickles stay fresh for up to 4 months from the date of manufacture. Slow-cooking with cold-pressed groundnut oil, salt, turmeric, and Guntur chillies acts as a natural preservative. Always use a clean, dry spoon and refrigerate after opening for extended freshness.',
  },
  {
    q: 'Is it normal for oil to settle at the top of the jar?',
    a: 'Yes! A natural layer of cold-pressed oil floating above the chicken pieces is essential—it seals out air and keeps the pickle fresh and aromatic.',
  },
  {
    q: 'How quickly will my order be delivered?',
    a: 'Orders are dispatched within 24–48 hours. Local deliveries in Hyderabad & Telangana arrive in 1–2 days, while pan-India courier deliveries take 3–6 business days. Orders ₹499 and above qualify for FREE delivery.',
  },
  {
    q: 'Can I cancel or modify my order after placing it?',
    a: 'Yes, you can cancel your order anytime before packing begins (while status is "Preparing Batch") from the My Orders page.',
  },
  {
    q: 'Do you take bulk orders for family functions, hostels, or NRI travel packing?',
    a: 'Yes! We offer special vacuum-sealed, flight-safe travel packing for international travel and bulk 1kg–5kg party packs. Message us directly on WhatsApp below.',
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [topic, setTopic] = useState('Order Delivery / Tracking');
  const [message, setMessage] = useState('');

  const handleSendWhatsAppTicket = (e) => {
    e.preventDefault();
    const whatsappNumber = process.env.NEXT_PUBLIC_OWNER_WHATSAPP || '919876543210';
    const text = `Hi Chicken Pickle Store Support! 🌶️\n*Topic:* ${topic}\n*Name:* ${name}\n*Phone:* ${phone}${
      orderId ? `\n*Order ID:* ${orderId}` : ''
    }\n*Message:* ${message}`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-amber-50 text-gray-900 pb-16">
      {/* Header */}
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
            href="/track"
            className="text-xs font-bold text-red-900 bg-amber-100 hover:bg-amber-200 px-3.5 py-2 rounded-full transition flex items-center gap-1.5"
          >
            <Truck size={14} />
            <span>Track Order</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Help Center & Customer Support
          </h1>
          <p className="text-xs text-gray-500">
            Quick answers on storage, shipping, bulk travel packs, or order assistance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left Column: FAQs */}
          <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <HelpCircle size={18} className="text-red-800" /> Frequently Asked Questions
            </h2>

            <div className="space-y-2.5">
              {FAQS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-amber-200/80 rounded-2xl overflow-hidden bg-amber-50/40"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      className="w-full p-3.5 text-left flex items-center justify-between gap-2 text-xs font-bold text-gray-900"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        size={15}
                        className={`text-red-800 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 text-xs text-gray-600 leading-relaxed border-t border-amber-100 pt-2">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Instant WhatsApp Support / Grievance Form */}
          <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                <MessageCircle size={18} className="text-emerald-600" /> Raise a Support / Grievance Request
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Connect directly with our kitchen & dispatch team on WhatsApp
              </p>
            </div>

            <form onSubmit={handleSendWhatsAppTicket} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Order ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. #A91FF3"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Issue / Inquiry Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-red-800"
                >
                  <option value="Order Delivery / Tracking">Order Delivery / Tracking</option>
                  <option value="Damaged / Leaking Jar Replacement">Damaged / Leaking Jar Replacement</option>
                  <option value="Bulk / NRI Travel Packing Inquiry">Bulk / NRI Travel Packing Inquiry</option>
                  <option value="Payment / Refund Query">Payment / Refund Query</option>
                  <option value="General Feedback">General Feedback</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Message *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe your question or issue..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 bg-amber-50/40 border border-amber-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-800"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-black font-black py-3 rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle size={16} />
                <span>Send Ticket via WhatsApp</span>
              </button>
            </form>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-red-800" /> Mon–Sat: 10 AM – 7 PM
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck size={13} /> FSSAI Certified Kitchen
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}