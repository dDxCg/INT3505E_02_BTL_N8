import { DishCard } from './DishCard';
import type { DishRead } from '../../types/schema';

interface DishGridProps {
  dishes: DishRead[];
  onAddDish: (dish: DishRead) => void;
  loading?: boolean;
}

export function DishGrid({ dishes, onAddDish, loading }: DishGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-2xl h-72 animate-pulse" />
        ))}
      </div>
    );
  }

  if (dishes.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg font-medium">No dishes found</p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {dishes.map((dish) => (
        <DishCard key={dish.id} dish={dish} onAdd={onAddDish} />
      ))}
    </div>
  );
}
