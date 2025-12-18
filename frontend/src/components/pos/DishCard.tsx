import { Plus } from 'lucide-react';
import type { DishRead } from '../../types/schema';
import { DishImage } from './DishImage';
import { formatCurrency } from '../../lib/utils';
import { Card } from '../ui/card';

interface DishCardProps {
  dish: DishRead;
  onAdd: (dish: DishRead) => void;
}

export function DishCard({ dish, onAdd }: DishCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 relative rounded-2xl shadow-sm">
      {/* Dish Image - Square aspect ratio with padding for floating effect */}
      <div className="p-3">
        <div className="relative overflow-hidden rounded-xl aspect-square">
          <DishImage
            imagePath={(dish as any).image}
            dishName={dish.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Dish Info */}
      <div className="px-3 pb-3 pt-1">
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-tight min-h-[2.5rem] mb-1">
          {dish.name}
        </h3>
        <p className="text-orange-500 font-bold text-base">
          {formatCurrency(dish.price)}
        </p>
      </div>

      {/* Add Button - Always visible at bottom right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAdd(dish);
        }}
        className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg active:scale-95"
        aria-label={`Add ${dish.name} to cart`}
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    </Card>
  );
}
