// frontend/context/CartContext.js
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

const getCartStorageKey = () => {
  if (typeof window === 'undefined') return 'pickle_cart_guest';
  try {
    const savedUser = localStorage.getItem('customer_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed?._id) return `pickle_cart_${parsed._id}`;
    }
  } catch (e) {}
  return 'pickle_cart_guest';
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [storageKey, setStorageKey] = useState('pickle_cart_guest');
  const [isHydrated, setIsHydrated] = useState(false);

  const loadCartForCurrentUser = useCallback(() => {
    const key = getCartStorageKey();
    setStorageKey(key);
    try {
      localStorage.removeItem('pickle_cart'); // Clear old shared cart
      const saved = localStorage.getItem(key);
      setCartItems(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setCartItems([]);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    loadCartForCurrentUser();
    window.addEventListener('auth-change', loadCartForCurrentUser);
    return () => window.removeEventListener('auth-change', loadCartForCurrentUser);
  }, [loadCartForCurrentUser]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cartItems, storageKey, isHydrated]);

  const addToCart = (product, variant) => {
    if (!variant) return;
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item._id === product._id && item.selectedVariant?.weight === variant.weight
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [...prev, { ...product, selectedVariant: variant, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, weight, newQty) => {
    if (newQty <= 0) {
      setCartItems((prev) =>
        prev.filter((item) => !(item._id === productId && item.selectedVariant?.weight === weight))
      );
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === productId && item.selectedVariant?.weight === weight
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);