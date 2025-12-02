import { Trash2, Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useCreateOrder, useCreateOrderItem } from '../../hooks/useApi';
import { useState } from 'react';

interface CartProps {
  tableId: number;
  onClose?: () => void;
}

export const Cart = ({ tableId, onClose }: CartProps) => {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } =
    useCartStore();
  const createOrder = useCreateOrder();
  const createOrderItem = useCreateOrderItem();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOrder = async () => {
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      // Step 1: Create order
      const orderResponse = await createOrder.mutateAsync({
        table_id: tableId,
        status_id: 1, // pending
      });

      const orderId = orderResponse.data.id;

      // Step 2: Create order items
      for (const item of items) {
        await createOrderItem.mutateAsync({
          order_id: orderId,
          dish_id: item.dish.id,
          quantity: item.quantity,
          status_id: 1, // pending
        });
      }

      // Step 3: Clear cart and show success
      clearCart();
      alert('Đã gửi order đến bếp thành công!');
      onClose?.();
    } catch (error) {
      console.error('Failed to submit order:', error);
      alert('Có lỗi xảy ra khi gửi order. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Giỏ hàng</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          )}
        </div>
        <div className="text-center py-12">
          <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Giỏ hàng trống</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Giỏ hàng ({totalItems} món)
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.dish.id}
            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item.dish.name}</h3>
              <p className="text-sm text-gray-600">
                {parseFloat(item.dish.price).toLocaleString('vi-VN')}đ
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.dish.id, item.quantity - 1)}
                className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.dish.id, item.quantity + 1)}
                className="p-1 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 min-w-20 text-right">
                {(parseFloat(item.dish.price) * item.quantity).toLocaleString('vi-VN')}đ
              </span>
              <button
                onClick={() => removeItem(item.dish.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-4">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Tổng cộng:</span>
          <span className="text-red-600">
            {totalPrice.toLocaleString('vi-VN')}đ
          </span>
        </div>

        <button
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi order đến bếp'}
        </button>

        <button
          onClick={clearCart}
          disabled={isSubmitting}
          className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Xóa tất cả
        </button>
      </div>
    </div>
  );
};
