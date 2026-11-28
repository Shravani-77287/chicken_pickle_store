// frontend/components/Footer.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, ShieldCheck, Truck, HelpCircle, FileText } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide storefront footer inside Owner Admin Portal
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-white border-t border-amber-200 text-gray-700 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
        {/* Brand & FSSAI */}
        <div className="space-y-3">
          <Link href="/" className="text-lg font-black text-red-800 tracking-wide block">
            CHICKEN PICKLE STORE
          </Link>
          <p className="text-gray-500 leading-relaxed">
            Small-batch, preservative-free homestyle chicken pickles slow-cooked in cold-pressed groundnut oil with authentic Telangana & Andhra spices.
          </p>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold text-[11px]">
            <ShieldCheck size={14} />
            <span>FSSAI Reg: 23626000000000</span>
          </div>
        </div>

        {/* Customer Links */}
        <div className="space-y-2.5">
          <h4 className="font-black text-gray-900 uppercase tracking-wider text-[11px]">
            Customer Care
          </h4>
          <ul className="space-y-2 font-semibold text-gray-600">
            <li>
              <Link href="/track" className="hover:text-red-800 flex items-center gap-1.5">
                <Truck size={13} className="text-red-800" /> Track Your Order
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-red-800 flex items-center gap-1.5">
                <Flame size={13} className="text-red-800" /> My Order History
              </Link>
            </li>
            <li>
              <Link href="/support" className="hover:text-red-800 flex items-center gap-1.5">
                <HelpCircle size={13} className="text-red-800" /> Help Center & Bulk Orders
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Policies */}
        <div className="space-y-2.5">
          <h4 className="font-black text-gray-900 uppercase tracking-wider text-[11px]">
            Policies & Legal
          </h4>
          <ul className="space-y-2 font-semibold text-gray-600">
            <li>
              <Link href="/policies#shipping" className="hover:text-red-800 flex items-center gap-1.5">
                <FileText size={13} className="text-gray-400" /> Shipping & Delivery Policy
              </Link>
            </li>
            <li>
              <Link href="/policies#refund" className="hover:text-red-800 flex items-center gap-1.5">
                <FileText size={13} className="text-gray-400" /> Cancellation & Refund Policy
              </Link>
            </li>
            <li>
              <Link href="/policies#privacy" className="hover:text-red-800 flex items-center gap-1.5">
                <FileText size={13} className="text-gray-400" /> Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/policies#terms" className="hover:text-red-800 flex items-center gap-1.5">
                <FileText size={13} className="text-gray-400" /> Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* Payments & Grievance Disclosure */}
        <div className="space-y-2.5">
          <h4 className="font-black text-gray-900 uppercase tracking-wider text-[11px]">
            100% Secure Checkout
          </h4>
          <p className="text-gray-500 leading-relaxed">
            Pay safely via UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking powered by <strong>Razorpay</strong>, or Cash on Delivery.
          </p>
          <p className="text-[11px] text-gray-500 pt-1">
            Kitchen Location: <strong>Hyderabad, Telangana</strong> •{' '}
            <Link href="/policies#grievance" className="text-red-800 font-bold underline">
              Grievance Officer
            </Link>
          </p>
        </div>
      </div>

      <div className="border-t border-amber-100 bg-amber-50/60 py-4 px-4 text-center text-[11px] text-gray-500">
        © {new Date().getFullYear()} Chicken Pickle Store. All rights reserved. • Made fresh in India 🌶️
      </div>
    </footer>
  );
}