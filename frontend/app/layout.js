// frontend/app/layout.js
import './globals.css';
import { CartProvider } from '../context/CartContext';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

export const metadata = {
  title: 'Chicken Pickle Store | Authentic Homestyle Non-Veg Pickles',
  description:
    'Fresh, preservative-free homestyle chicken pickles cooked with cold-pressed groundnut oil and Guntur spices. Free delivery above ₹499.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-amber-50 text-gray-900 antialiased">
        <CartProvider>
          <div className="flex-1">{children}</div>
          <Footer />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}