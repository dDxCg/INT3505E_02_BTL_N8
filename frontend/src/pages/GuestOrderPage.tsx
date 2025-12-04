import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Loader2, CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/cart';
import {
  getDishes,
  createOrder,
  addOrderItem,
} from '../services/api';
import { ordersApi } from '../api/services';
import type { DishRead, OrderRead } from '../types/schema';

export default function GuestOrderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = parseInt(searchParams.get('tableId') || '0');

  // State
  const [dishes, setDishes] = useState<DishRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Cart store
  const {
    items,
    addToCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    getCartItems,
  } = useCartStore();

  // ============================================
  // FETCH DISHES
  // ============================================

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        const data = await getDishes();
        setDishes(data);
      } catch (error) {
        console.error('Failed to fetch dishes:', error);
        showToastMessage('Không thể tải menu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  // ============================================
  // TOAST HELPER
  // ============================================

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ============================================
  // CART HELPERS
  // ============================================

  const getItemQuantity = (dishId: number): number => {
    const item = items.get(dishId);
    return item ? item.quantity : 0;
  };

  const handleIncrement = (dish: DishRead) => {
    addToCart(dish, 1);
  };

  const handleDecrement = (dishId: number) => {
    const currentQty = getItemQuantity(dishId);
    if (currentQty > 0) {
      updateQuantity(dishId, currentQty - 1);
    }
  };

  // ============================================
  // SUBMIT ORDER LOGIC
  // ============================================

  const handleSubmitOrder = async () => {
    if (tableId === 0) {
      showToastMessage('Không tìm thấy bàn. Vui lòng quét lại QR code.');
      return;
    }

    const cartItems = getCartItems();
    if (cartItems.length === 0) {
      showToastMessage('Giỏ hàng trống. Vui lòng chọn món.');
      return;
    }

    try {
      setSubmitting(true);

      // Step 1: Check if there's an active order for this table
      const activeOrder = await ordersApi.getActiveOrder(tableId);
      let orderId: number;

      if (activeOrder) {
        // Branch B: Use existing active order
        orderId = activeOrder.id;
      } else {
        // Branch A: Create new order
        const newOrder = await createOrder({
          table_id: tableId,
          status_id: 1, // Pending
        });
        orderId = newOrder.id;
      }

      // Step 2: Add all items from cart to order (existing or new)
      for (const item of cartItems) {
        await addOrderItem({
          order_id: orderId,
          dish_id: item.dish.id,
          quantity: item.quantity,
          status_id: 1, // Pending
        });
      }

      // Step 3: Clear cart and show success
      clearCart();
      showToastMessage(
        activeOrder
          ? '✅ Món mới đã được thêm vào đơn!'
          : '✅ Gọi món thành công! Món sẽ được phục vụ sớm.'
      );

      // Step 4: Redirect to My Order page
      setTimeout(() => {
        navigate(`/guest/my-order?tableId=${tableId}`);
      }, 1500);
    } catch (error) {
      console.error('Failed to submit order:', error);
      showToastMessage('❌ Gọi món thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // FORMAT PRICE
  // ============================================

  const formatPrice = (price: number): string => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
          <p className="text-sm text-gray-500">Bàn số {tableId}</p>
        </div>
      </header>

      {/* Menu Grid */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          {dishes.map((dish) => {
            const quantity = getItemQuantity(dish.id);

            return (
              <div
                key={dish.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Dish Image Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <span className="text-6xl">🍜</span>
                </div>

                {/* Dish Info */}
                <div className="p-3">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">
                    {dish.name}
                  </h3>
                  {dish.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                      {dish.description}
                    </p>
                  )}
                  <p className="text-orange-600 font-bold mb-3">
                    {formatPrice(dish.price)}
                  </p>

                  {/* Add/Remove Buttons */}
                  {quantity === 0 ? (
                    <button
                      onClick={() => handleIncrement(dish)}
                      className="w-full bg-orange-500 text-white rounded-full py-2 font-semibold text-sm hover:bg-orange-600 transition-colors"
                    >
                      Thêm món
                    </button>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleDecrement(dish.id)}
                        className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <Minus className="w-5 h-5 text-gray-700" />
                      </button>
                      <span className="font-bold text-lg text-gray-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleIncrement(dish)}
                        className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors"
                      >
                        <Plus className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Cart (Sticky Bottom) */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-500 shadow-lg z-20">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-gray-900">
                  {totalItems} món
                </span>
              </div>
              <span className="font-bold text-xl text-orange-600">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="w-full bg-orange-500 text-white rounded-lg py-3 font-bold text-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Gửi gọi món'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
