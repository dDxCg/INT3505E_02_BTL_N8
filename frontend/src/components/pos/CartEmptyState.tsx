import { ShoppingCart } from 'lucide-react';

export function CartEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mb-4">
        <ShoppingCart size={48} className="text-orange-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Select a table and start adding dishes from the menu to create an order
      </p>
    </div>
  );
}
