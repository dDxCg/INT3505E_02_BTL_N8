import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DishRead } from '../types/schema';

// ============================================
// TYPES
// ============================================

export interface CartItem {
  dish: DishRead;
  quantity: number;
}

export interface CartState {
  items: Map<number, CartItem>; // Key = dish_id
  addToCart: (dish: DishRead, quantity?: number) => void;
  removeFromCart: (dishId: number) => void;
  updateQuantity: (dishId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getCartItems: () => CartItem[];
}

// ============================================
// ZUSTAND STORE
// ============================================

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: new Map(),

      /**
       * Add dish to cart or increment quantity
       */
      addToCart: (dish: DishRead, quantity = 1) => {
        set((state) => {
          const newItems = new Map(state.items);
          const existingItem = newItems.get(dish.id);

          if (existingItem) {
            // Increment quantity
            newItems.set(dish.id, {
              ...existingItem,
              quantity: existingItem.quantity + quantity,
            });
          } else {
            // Add new item
            newItems.set(dish.id, { dish, quantity });
          }

          return { items: newItems };
        });
      },

      /**
       * Remove dish from cart completely
       */
      removeFromCart: (dishId: number) => {
        set((state) => {
          const newItems = new Map(state.items);
          newItems.delete(dishId);
          return { items: newItems };
        });
      },

      /**
       * Update quantity of specific dish
       * If quantity = 0, remove from cart
       */
      updateQuantity: (dishId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(dishId);
          return;
        }

        set((state) => {
          const newItems = new Map(state.items);
          const existingItem = newItems.get(dishId);

          if (existingItem) {
            newItems.set(dishId, {
              ...existingItem,
              quantity,
            });
          }

          return { items: newItems };
        });
      },

      /**
       * Clear entire cart
       */
      clearCart: () => {
        set({ items: new Map() });
      },

      /**
       * Calculate total price
       */
      getTotalPrice: () => {
        const items = get().items;
        let total = 0;

        items.forEach((item) => {
          total += item.dish.price * item.quantity;
        });

        return total;
      },

      /**
       * Get total number of items (sum of quantities)
       */
      getTotalItems: () => {
        const items = get().items;
        let total = 0;

        items.forEach((item) => {
          total += item.quantity;
        });

        return total;
      },

      /**
       * Get cart items as array
       */
      getCartItems: () => {
        return Array.from(get().items.values());
      },
    }),
    {
      name: 'restaurant-cart-storage',
      // Custom storage to handle Map serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;

          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              items: new Map(Object.entries(state.items || {})),
            },
          };
        },
        setItem: (name, value) => {
          const str = JSON.stringify({
            state: {
              ...value.state,
              items: Object.fromEntries(value.state.items),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
