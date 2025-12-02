import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartState, Dish, CartItem } from '../types';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (dish: Dish, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.dish.id === dish.id);

          if (existingItem) {
            // Update quantity if item already exists
            return {
              items: state.items.map((item) =>
                item.dish.id === dish.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          } else {
            // Add new item
            return {
              items: [...state.items, { dish, quantity }],
            };
          }
        });
      },

      removeItem: (dishId: number) => {
        set((state) => ({
          items: state.items.filter((item) => item.dish.id !== dishId),
        }));
      },

      updateQuantity: (dishId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(dishId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.dish.id === dishId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalPrice: () => {
        const items = get().items;
        return items.reduce((total, item) => {
          return total + parseFloat(item.dish.price) * item.quantity;
        }, 0);
      },

      getTotalItems: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'restaurant-cart-storage',
    }
  )
);
