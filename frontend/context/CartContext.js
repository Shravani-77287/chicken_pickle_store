// frontend/context/CartContext.js
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const CartContext = createContext();

const getCartStorageKey = () => {
  if (typeof window === 'undefined') return 'pickle_cart_guest';
  try {
    const rawUser = localStorage.getItem('customer_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      const user = parsed?.user || parsed;
      const uniqueId = user?._id || user?.id || user?.email;
      if (uniqueId) {
        return `pickle_cart_${String(uniqueId).toLowerCase().trim()}`;
      }
    }
  } catch (e) {}
  return 'pickle_cart_guest';
};

const writeCartToStorage = (items) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('pickle_cart');
    localStorage.setItem(getCartStorageKey(), JSON.stringify(items));
  } catch (e) {
    console.error('Cart save error:', e);
  }
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();

  const syncCartWithUser = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('pickle_cart');
      const key = getCartStorageKey();
      const saved = localStorage.getItem(key);
      setCartItems(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    syncCartWithUser();
    window.addEventListener('auth-change', syncCartWithUser);
    window.addEventListener('storage', syncCartWithUser);
    return () => {
      window.removeEventListener('auth-change', syncCartWithUser);
      window.removeEventListener('storage', syncCartWithUser);
    };
  }, [syncCartWithUser, pathname]);

  const addToCart = (product, variant) => {
    if (!variant) return;
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (item) => item._id === product._id && item.selectedVariant?.weight === variant.weight
      );
      let next;
      if (idx > -1) {
        next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
      } else {
        next = [...prev, { ...product, selectedVariant: variant, quantity: 1 }];
      }
      writeCartToStorage(next);
      return next;
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, weight, newQty) => {
    setCartItems((prev) => {
      const next =
        newQty <= 0
          ? prev.filter((item) => !(item._id === productId && item.selectedVariant?.weight === weight))
          : prev.map((item) =>
              item._id === productId && item.selectedVariant?.weight === weight
                ? { ...item, quantity: newQty }
                : item
            );
      writeCartToStorage(next);
      return next;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    writeCartToStorage([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        clearCart,
        syncCartWithUser,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);