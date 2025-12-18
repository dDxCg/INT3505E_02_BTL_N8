import { Plus } from 'lucide-react';
import type { Dish } from '../../types';

interface DishCardProps {
  dish: Dish;
  onAddToCart: (dish: Dish) => void;
}

export const DishCard = ({ dish, onAddToCart }: DishCardProps) => {
  // Default placeholder image if no image_url is provided
  const imageUrl = dish.image_url || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Dish Image */}
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.currentTarget.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80';
          }}
        />
      </div>
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
