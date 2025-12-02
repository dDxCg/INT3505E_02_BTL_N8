import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingCart, Search } from 'lucide-react';
import { useDishes } from '../../hooks/useApi';
import { useCartStore } from '../../stores/cartStore';
import { DishCard } from '../../components/guest/DishCard';
import { Cart } from '../../components/guest/Cart';
import type { Dish } from '../../types';

export const MenuPage = () => {
  const [searchParams] = useSearchParams();
  const tableId = parseInt(searchParams.get('tableId') || '0');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);

  const { data: dishes, isLoading, error } = useDishes();
  const { addItem, getTotalItems } = useCartStore();

  const handleAddToCart = (dish: Dish) => {
    addItem(dish, 1);
    // Optional: Show a toast notification
  };

  const filteredDishes = dishes?.filter((dish) =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = getTotalItems();

  if (!tableId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy bàn
          </h1>
          <p className="text-gray-600">Vui lòng quét mã QR trên bàn để order</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Có lỗi xảy ra</h1>
          <p className="text-gray-600">Không thể tải menu. Vui lòng thử lại.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Menu - Bàn {tableId}</h1>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative p-2 bg-red-700 hover:bg-red-800 rounded-lg transition-colors"
            >
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Grid */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-md p-4 animate-pulse"
                  >
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredDishes && filteredDishes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDishes.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  {searchQuery
                    ? 'Không tìm thấy món ăn phù hợp'
                    : 'Chưa có món ăn nào'}
                </p>
              </div>
            )}
          </div>

          {/* Cart Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <Cart tableId={tableId} />
            </div>
          </div>
        </div>
      </div>

      {/* Cart Modal (Mobile) */}
      {showCart && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto">
            <Cart tableId={tableId} onClose={() => setShowCart(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
