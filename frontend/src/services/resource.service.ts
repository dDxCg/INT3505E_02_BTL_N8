import apiClient from '@/lib/api-client';
import type { Dish, Table, Ingredient } from '@/types/schema';

export const ResourceService = {
  getDishes: async () => {
    return apiClient.get<Dish[]>('/resources/dishes');
  },

  getTables: async () => {
    return apiClient.get<Table[]>('/resources/tables');
  },

  getIngredients: async () => {
    return apiClient.get<Ingredient[]>('/resources/ingredients');
  }
};