'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '@/lib/types';

/** Builds a unique line key from a product + removed ingredients combination */
export const buildCartKey = (productId: number, removedIngredients: string[] = []): string => {
  const removed = [...removedIngredients].sort().join('|');
  return removed ? `${productId}-no-${removed}` : `${productId}`;
};

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; quantity?: number; removedIngredients?: string[] }
  | { type: 'REMOVE_ITEM'; key: string }
  | { type: 'UPDATE_QUANTITY'; key: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_DRAWER'; isOpen?: boolean }
  | { type: 'LOAD_CART'; items: CartItem[] };

const initialState: CartState = {
  items: [],
  isOpen: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const quantityToAdd = action.quantity ?? 1;
      const removedIngredients = action.removedIngredients ?? [];
      const key = buildCartKey(action.product.id, removedIngredients);
      const existingItem = state.items.find(item => item.key === key);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.key === key
              ? { ...item, quantity: item.quantity + quantityToAdd }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { key, product: action.product, quantity: quantityToAdd, removedIngredients }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.key !== action.key),
      };
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.key !== action.key),
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.key === action.key
            ? { ...item, quantity: action.quantity }
            : item
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'TOGGLE_DRAWER':
      return { ...state, isOpen: action.isOpen ?? !state.isOpen };
    case 'LOAD_CART':
      return { ...state, items: action.items };
    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, removedIngredients?: string[]) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: (isOpen?: boolean) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'food-ordering-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const items = JSON.parse(stored);
        // Migrate legacy carts (no key / no removedIngredients)
        const migrated: CartItem[] = (Array.isArray(items) ? items : [])
          .filter((item: CartItem) => item && item.product)
          .map((item: CartItem) => ({
            ...item,
            removedIngredients: item.removedIngredients ?? [],
            key: item.key ?? buildCartKey(item.product.id, item.removedIngredients ?? []),
          }));
        dispatch({ type: 'LOAD_CART', items: migrated });
      } catch (e) {
        console.error('Failed to load cart from storage');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (product: Product, quantity?: number, removedIngredients?: string[]) =>
    dispatch({ type: 'ADD_ITEM', product, quantity, removedIngredients });
  const removeItem = (key: string) => dispatch({ type: 'REMOVE_ITEM', key });
  const updateQuantity = (key: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', key, quantity });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const toggleDrawer = (isOpen?: boolean) => dispatch({ type: 'TOGGLE_DRAWER', isOpen });

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleDrawer,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
