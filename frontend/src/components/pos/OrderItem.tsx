import { Minus, Plus, Trash2 } from 'lucide-react';
import type { OrderItemRead } from '../../types/schema';
import { formatCurrency } from '../../lib/utils';

interface OrderItemProps {
  item: OrderItemRead;
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  onRemove: (itemId: number) => void;
  disabled?: boolean;
}

export function OrderItem({ item, onUpdateQuantity, onRemove, disabled }: OrderItemProps) {
  const itemTotal = Number(item.dish.price) * item.quantity;

  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <div className="space-y-2">
      {/* Row 1: Item Name & Remove Button */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 text-sm flex-1">
          {item.dish.name}
        </h4>
        <button
          onClick={() => onRemove(item.id)}
          disabled={disabled}
          className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-3"
          aria-label="Remove item"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Row 2: Price Info & Quantity Controls */}
      <div className="flex items-center justify-between">
        {/* Left: Price x Qty = Total */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span className="text-orange-500 font-semibold">{formatCurrency(item.dish.price)}</span>
          <span>×</span>
          <span>{item.quantity}</span>
          <span>=</span>
          <span className="text-orange-500 font-bold text-sm">{formatCurrency(itemTotal)}</span>
        </div>

        {/* Right: Quantity Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDecrement}
            disabled={disabled || item.quantity <= 1}
            className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus size={14} strokeWidth={2.5} />
          </button>
          <span className="w-6 text-center font-semibold text-sm text-gray-900">{item.quantity}</span>
          <button
            onClick={handleIncrement}
            disabled={disabled}
            className="w-6 h-6 rounded bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase quantity"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
