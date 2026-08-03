// frontend/context/CartContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load saved cart once on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('pickle_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load cart:', e);
    }
  }, []);

  // Sync to localStorage on state change
  useEffect(() => {
    localStorage.setItem('pickle_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, variant) => {
    if (!product) return;

    const selectedVariant = variant || product.variants?.[0] || {
      weight: '250g',
      price: 299,
      originalPrice: 350,
    };

    const productId = product._id || product.id || String(Date.now());

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item._id === productId &&
          item.selectedVariant?.weight === selectedVariant.weight
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            _id: productId,
            name: product.name || 'Chicken Pickle',
            images: product.images || ['/images/placeholder.jpg'],
            selectedVariant,
            quantity: 1,
          },
        ];
      }
    });

    // Automatically slide open the cart drawer
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, weight, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, weight);
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

  const removeFromCart = (productId, weight) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item._id === productId && item.selectedVariant?.weight === weight)
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('pickle_cart');
  };

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}