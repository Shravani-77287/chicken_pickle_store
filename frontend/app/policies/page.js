// frontend/app/policies/page.js
'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  FileText,
  Lock,
  Building2,
} from 'lucide-react';

export default function PoliciesPage() {
  return (
    <main className="min-h-screen bg-amber-50 text-gray-900 pb-16">
      {/* Top Navigation */}
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
            href="/support"
            className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-full transition"
          >
            Help & Support
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Store Policies & Legal Disclosures
          </h1>
          <p className="text-xs text-gray-500">
            Last updated: November 2026 • Compliant with Indian Consumer Protection (E-Commerce) Rules
          </p>
        </div>

        {/* Quick Jump Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          <a
            href="#shipping"
            className="text-xs font-bold bg-white border border-amber-200 px-3.5 py-1.5 rounded-full hover:bg-amber-100 transition"
          >
            🚚 Shipping Policy
          </a>
          <a
            href="#refund"
            className="text-xs font-bold bg-white border border-amber-200 px-3.5 py-1.5 rounded-full hover:bg-amber-100 transition"
          >
            🔄 Cancellation & Refunds
          </a>
          <a
            href="#privacy"
            className="text-xs font-bold bg-white border border-amber-200 px-3.5 py-1.5 rounded-full hover:bg-amber-100 transition"
          >
            🔒 Privacy Policy
          </a>
          <a
            href="#terms"
            className="text-xs font-bold bg-white border border-amber-200 px-3.5 py-1.5 rounded-full hover:bg-amber-100 transition"
          >
            📜 Terms & Conditions
          </a>
          <a
            href="#grievance"
            className="text-xs font-bold bg-white border border-amber-200 px-3.5 py-1.5 rounded-full hover:bg-amber-100 transition"
          >
            🛡️ FSSAI & Grievance Officer
          </a>
        </div>

        {/* 1. Shipping & Delivery Policy */}
        <section
          id="shipping"
          className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-3 scroll-mt-24"
        >
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Truck size={18} className="text-red-800" /> 1. Shipping & Delivery Policy
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-xs text-gray-700 leading-relaxed">
            <li>
              <strong>Fresh Batch Preparation & Dispatch:</strong> All pickle jars are freshly packed and dispatched within <strong>24 to 48 hours</strong> of order confirmation.
            </li>
            <li>
              <strong>Delivery Timelines:</strong> Local orders (Hyderabad & Telangana) are delivered within <strong>1–2 business days</strong>. Rest of India courier shipments take <strong>3–6 business days</strong> depending on your PIN code.
            </li>
            <li>
              <strong>Shipping Charges:</strong> Enjoy <strong>FREE Delivery</strong> on all orders worth <strong>₹499 or above</strong>. A flat ₹30 delivery fee applies to orders below ₹499.
            </li>
            <li>
              <strong>Leak-Proof Packaging:</strong> Every jar is induction-sealed, bubble-wrapped, and packed in food-grade corrugated boxes to prevent oil leakage during transit.
            </li>
          </ul>
        </section>

        {/* 2. Cancellation & Refund Policy */}
        <section
          id="refund"
          className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-3 scroll-mt-24"
        >
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <RotateCcw size={18} className="text-red-800" /> 2. Cancellation, Return & Refund Policy
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-xs text-gray-700 leading-relaxed">
            <li>
              <strong>Order Cancellation:</strong> You can cancel your order anytime before it is packed (while status is <em>“Preparing Batch”</em>) directly from your <Link href="/orders" className="text-red-800 font-bold underline">My Orders</Link> page for a 100% refund. Once packed or handed over to the courier, orders cannot be cancelled.
            </li>
            <li>
              <strong>Food Safety & Non-Returnable Policy:</strong> Due to hygiene and perishable food safety regulations, opened or consumed pickle jars cannot be returned.
            </li>
            <li>
              <strong>Damaged, Leaking, or Wrong Item:</strong> If you receive a broken jar, tampered seal, or incorrect weight variant, please share a clear <strong>unboxing video and photos within 24 hours of delivery</strong> via our <Link href="/support" className="text-red-800 font-bold underline">Support Page</Link> or WhatsApp. We will dispatch a free replacement jar or issue a full refund.
            </li>
            <li>
              <strong>Refund Processing Time:</strong> Approved prepaid refunds (Razorpay / UPI / Cards) are credited back to your original payment source within <strong>5–7 business days</strong>.
            </li>
          </ul>
        </section>

        {/* 3. Privacy Policy */}
        <section
          id="privacy"
          className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-3 scroll-mt-24"
        >
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Lock size={18} className="text-red-800" /> 3. Privacy Policy
          </h2>
          <p className="text-xs text-gray-700 leading-relaxed">
            In accordance with India's Digital Personal Data Protection (DPDP) Act, 2023, we collect only the essential details required to process and deliver your order: your <strong>name, phone number, email address, delivery address, and PIN code</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-gray-700 leading-relaxed">
            <li>
              <strong>Payment Security:</strong> We do not store your credit/debit card numbers or UPI PINs. All online transactions are encrypted and processed directly by <strong>Razorpay</strong> (PCI-DSS compliant).
            </li>
            <li>
              <strong>Zero Third-Party Selling:</strong> Your contact details are shared strictly with our delivery/courier partners for order fulfillment and are never sold or rented to marketing agencies.
            </li>
          </ul>
        </section>

        {/* 4. Terms & Conditions */}
        <section
          id="terms"
          className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-3 scroll-mt-24"
        >
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <FileText size={18} className="text-red-800" /> 4. Terms & Conditions
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-xs text-gray-700 leading-relaxed">
            <li>
              All product prices listed on Chicken Pickle Store are in Indian Rupees (₹ / INR) and inclusive of applicable taxes.
            </li>
            <li>
              Because our pickles are crafted in small homestyle batches without artificial preservatives, slight natural variations in oil colour or spice aroma may occur between batches.
            </li>
            <li>
              Customers must always use a clean, dry spoon and ensure the oil layer covers the pickle pieces to preserve the 4-month shelf life.
            </li>
          </ul>
        </section>

        {/* 5. FSSAI & Grievance Officer Disclosure */}
        <section
          id="grievance"
          className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm space-y-3 scroll-mt-24"
        >
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Building2 size={18} className="text-red-800" /> 5. Statutory & Grievance Officer Details
          </h2>
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-1.5 text-xs text-gray-800">
            <p>
              <strong>Legal Business Name:</strong> Chicken Pickle Store (Homestyle Foods)
            </p>
            <p>
              <strong>FSSAI Registration / License No.:</strong> 23626000000000
            </p>
            <p>
              <strong>Kitchen & Dispatch Location:</strong> Hyderabad, Telangana, India
            </p>
            <p>
              <strong>Grievance Officer:</strong> Store Operations Head • Support Hours: Mon–Sat, 10:00 AM – 7:00 PM IST
            </p>
            <p className="flex items-center gap-1.5 text-emerald-800 font-bold pt-1">
              <ShieldCheck size={15} /> All grievances are acknowledged within 24 hours and resolved within 7 business days.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}