import { Plus } from 'lucide-react';
import type { Dish } from '../../types';

interface DishCardProps {
  dish: Dish;
  onAddToCart: (dish: Dish) => void;
}

export const DishCard = ({ dish, onAddToCart }: DishCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{dish.name}</h3>
          <span className="text-lg font-bold text-red-600">
            {parseFloat(dish.price).toLocaleString('vi-VN')}đ
          </span>
        </div>
        {dish.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {dish.description}
          </p>
        )}
        <button
          onClick={() => onAddToCart(dish)}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={20} />
          <span>Thêm vào giỏ</span>
        </button>
      </div>
    </div>
  );
};
