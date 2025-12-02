import { Check, Clock } from 'lucide-react';
import type { OrderItemRead } from '../../types';

interface OrderItemCardProps {
  item: OrderItemRead;
  onUpdateStatus: (itemId: number, statusId: number) => void;
}

export const OrderItemCard = ({ item, onUpdateStatus }: OrderItemCardProps) => {
  const isPending = item.status_id === 1; // Assuming 1 = pending
  const isServed = item.status_id === 2; // Assuming 2 = served

  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        isServed
          ? 'bg-green-50 border-green-500'
          : 'bg-yellow-50 border-yellow-500'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{item.dish.name}</h3>
          <p className="text-sm text-gray-600">
            {parseFloat(item.dish.price).toLocaleString('vi-VN')}đ x {item.quantity}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900">
            {(parseFloat(item.dish.price) * item.quantity).toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {isServed ? (
            <>
              <Check size={16} className="text-green-600" />
              <span className="text-green-600 font-medium">Đã phục vụ</span>
            </>
          ) : (
            <>
              <Clock size={16} className="text-yellow-600" />
              <span className="text-yellow-600 font-medium">Đang chờ</span>
            </>
          )}
        </div>

        {isPending && (
          <button
            onClick={() => onUpdateStatus(item.id, 2)} // Mark as served
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
          >
            Đánh dấu đã phục vụ
          </button>
        )}
      </div>
    </div>
  );
};
