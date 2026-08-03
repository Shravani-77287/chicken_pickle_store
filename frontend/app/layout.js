// frontend/app/layout.js
import './globals.css';
import { CartProvider } from '../context/CartContext';

export const metadata = {
  title: 'Chicken Pickle Store',
  description: 'Authentic Homestyle Chicken Pickles',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}