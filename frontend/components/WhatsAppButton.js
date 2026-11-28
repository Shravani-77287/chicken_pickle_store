// frontend/components/WhatsAppButton.js
'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const pathname = usePathname();

  // Hide on admin pages
  if (pathname?.startsWith('/admin')) return null;

  const whatsappNumber = process.env.NEXT_PUBLIC_OWNER_WHATSAPP || '919876543210';
  const message = encodeURIComponent(
    'Hi Chicken Pickle Store! 🌶️ I have a question about your fresh chicken pickle batches.'
  );

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 bg-[#25D366] hover:bg-[#1ebe5d] text-black font-black text-xs px-4 py-3 rounded-full shadow-lg flex items-center gap-2 transition hover:scale-105"
    >
      <MessageCircle size={18} />
      <span className="hidden sm:inline">WhatsApp Us</span>
    </a>
  );
}