'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { formatPrice } from '@/lib/utils';

import type { ImageField } from '@prismicio/client';

export interface CartItem {
  id: string; // Stripe product ID
  name: string;
  price: number; // Price in cents
  currency: string;
  priceId: string; // Stripe price ID
  quantity: number;
  size?: string;
  image?: ImageField;
  metadata?: Record<string, string>;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getFormattedTotal: (locale?: string) => string;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cart-items';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setItems(Array.isArray(parsedCart) ? parsedCart : []);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [items, isLoaded]);

  const addItem = (
    newItem: Omit<CartItem, 'quantity'> & { quantity?: number }
  ) => {
    setItems((prevItems) => {
      // Create unique key based on product ID and size
      const itemKey = `${newItem.id}-${newItem.size || ''}`;
      const existingItemIndex = prevItems.findIndex(
        (item) => `${item.id}-${item.size || ''}` === itemKey
      );

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity:
            updatedItems[existingItemIndex].quantity + (newItem.quantity || 1),
        };
        return updatedItems;
      } else {
        // New item, add to cart
        return [...prevItems, { ...newItem, quantity: newItem.quantity || 1 }];
      }
    });
  };

  const removeItem = (id: string, size?: string) => {
    setItems((prevItems) => {
      const itemKey = `${id}-${size || ''}`;
      return prevItems.filter(
        (item) => `${item.id}-${item.size || ''}` !== itemKey
      );
    });
  };

  const updateQuantity = (id: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeItem(id, size);
      return;
    }

    setItems((prevItems) => {
      const itemKey = `${id}-${size || ''}`;
      return prevItems.map((item) => {
        if (`${item.id}-${item.size || ''}` === itemKey) {
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getFormattedTotal = (locale?: string) => {
    const total = getTotalPrice();
    const currency = items[0]?.currency || 'usd';
    const currentLocale = locale || 'en-us';

    return formatPrice(total, currency, currentLocale); // Use actual currency units, no cents
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getFormattedTotal,
    isCartOpen,
    setIsCartOpen,
    openCart,
    closeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
