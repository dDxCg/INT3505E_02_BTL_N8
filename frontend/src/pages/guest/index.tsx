import { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, ArrowLeft, X, ChevronRight } from 'lucide-react';
import { useDishes, useCreateOrder, useCreateOrderItem } from '../../hooks/useApi';
import { useCartStore } from '../../stores/cartStore';
import type { Dish } from '../../types';
import './styles.css';

// Mock categories - replace with actual data if available
const CATEGORIES = [
  { id: 'all', label: 'Tất cả', active: true },
  { id: 'appetizers', label: 'Khai vị' },
  { id: 'mains', label: 'Món chính' },
  { id: 'desserts', label: 'Tráng miệng' },
  { id: 'beverages', label: 'Đồ uống' },
  { id: 'specials', label: 'Đặc biệt' },
];

export default function GuestOrderPage() {
  const [searchParams] = useSearchParams();
  const { tableId: tableIdParam } = useParams<{ tableId?: string }>();
  const navigate = useNavigate();

  // Support both path parameter (/order/5) and query parameter (/order?tableId=5)
  const tableId = parseInt(tableIdParam || searchParams.get('tableId') || '0');

  const [activeCategory, setActiveCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { data: dishes, isLoading, error } = useDishes();
  const { items, addItem, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCartStore();

  const createOrder = useCreateOrder();
  const createOrderItem = useCreateOrderItem();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddToCart = (dish: Dish) => {
    addItem(dish, 1);
    showToastNotification('Đã thêm vào giỏ hàng');
  };

  const handleIncrease = (dishId: number) => {
    const item = items.find(i => i.dish.id === dishId);
    if (item) {
      updateQuantity(dishId, item.quantity + 1);
    }
  };

  const handleDecrease = (dishId: number) => {
    const item = items.find(i => i.dish.id === dishId);
    if (item) {
      if (item.quantity === 1) {
        removeItem(dishId);
      } else {
        updateQuantity(dishId, item.quantity - 1);
      }
    }
  };

  const getItemQuantity = (dishId: number) => {
    return items.find(i => i.dish.id === dishId)?.quantity || 0;
  };

  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleSubmitOrder = async () => {
    if (!tableId) {
      showToastNotification('Không tìm thấy bàn');
      return;
    }

    if (items.length === 0) {
      showToastNotification('Giỏ hàng trống');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create order
      const orderResponse = await createOrder.mutateAsync({
        table_id: tableId,
        status_id: 1, // Pending
      });

      // Add all items
      for (const item of items) {
        await createOrderItem.mutateAsync({
          order_id: orderResponse.data.id,
          dish_id: item.dish.id,
          quantity: item.quantity,
          status_id: 1,
        });
      }

      clearCart();
      setShowCart(false);
      showToastNotification('Đặt món thành công!');

      // Redirect to My Order page after 1.5 seconds
      setTimeout(() => {
        navigate(`/my-order/${tableId}`);
      }, 1500);
    } catch (err) {
      showToastNotification('Đặt món thất bại. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numPrice);
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (!tableId) {
    return (
      <div className="guest-order-page error-state">
        <div className="error-content">
          <div className="error-icon">🍽️</div>
          <h1 className="error-title">Không tìm thấy bàn</h1>
          <p className="error-text">Vui lòng quét mã QR trên bàn để đặt món</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="guest-order-page error-state">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h1 className="error-title">Có lỗi xảy ra</h1>
          <p className="error-text">Không thể tải menu. Vui lòng thử lại.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="guest-order-page">
      {/* Sticky Header */}
      <header className="sticky-header">
        <div className="header-top">
          <div className="header-left">
            <button className="back-button" aria-label="Back">
              <ArrowLeft size={20} />
            </button>
            <h1 className="page-title">Menu</h1>
          </div>
          <div className="header-right">
            <div className="table-badge">
              <span className="table-label">Bàn</span>
              <span className="table-number">{tableId}</span>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="categories-wrapper">
          <div className="categories-scroll">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`category-pill ${activeCategory === category.id ? 'active' : ''}`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">
          {isLoading ? (
            <div className="dishes-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="dish-card skeleton">
                  <div className="dish-image skeleton-image"></div>
                  <div className="dish-content">
                    <div className="skeleton-text skeleton-title"></div>
                    <div className="skeleton-text skeleton-desc"></div>
                    <div className="skeleton-text skeleton-price"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : dishes && dishes.length > 0 ? (
            <div className="dishes-grid">
              {dishes.map((dish, index) => {
                const quantity = getItemQuantity(dish.id);
                return (
                  <article
                    key={dish.id}
                    className="dish-card"
                    style={{
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    <div className="dish-image">
                      <img
                        src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80"
                        alt={dish.name}
                        className="dish-image-img"
                        loading="lazy"
                      />
                      {quantity > 0 && (
                        <div className="quantity-badge">{quantity}</div>
                      )}
                    </div>
                    <div className="dish-content">
                      <h3 className="dish-name">{dish.name}</h3>
                      {dish.description && (
                        <p className="dish-description">{dish.description}</p>
                      )}
                      <div className="dish-footer">
                        <span className="dish-price">{formatPrice(dish.price)}</span>
                        {quantity === 0 ? (
                          <button
                            onClick={() => handleAddToCart(dish)}
                            className="add-button"
                          >
                            <Plus size={16} />
                          </button>
                        ) : (
                          <div className="quantity-controls">
                            <button
                              onClick={() => handleDecrease(dish.id)}
                              className="qty-button minus"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="qty-display">{quantity}</span>
                            <button
                              onClick={() => handleIncrease(dish.id)}
                              className="qty-button plus"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p className="empty-text">Chưa có món ăn nào</p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="floating-cart-button"
        >
          <div className="cart-button-content">
            <div className="cart-icon-wrapper">
              <span className="cart-badge">{totalItems}</span>
              <span className="cart-total">{formatPrice(totalPrice)}</span>
            </div>
            <div className="cart-action">
              <span className="cart-text">Xem giỏ hàng</span>
              <ChevronRight size={20} />
            </div>
          </div>
        </button>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="cart-modal-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2 className="cart-title">Giỏ hàng của bạn</h2>
              <button onClick={() => setShowCart(false)} className="close-button">
                <X size={24} />
              </button>
            </div>

            <div className="cart-items">
              {items.map((item) => (
                <div key={item.dish.id} className="cart-item">
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.dish.name}</h4>
                    <p className="cart-item-price">{formatPrice(item.dish.price)}</p>
                  </div>
                  <div className="cart-item-controls">
                    <button
                      onClick={() => handleDecrease(item.dish.id)}
                      className="cart-qty-button"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="cart-qty-display">{item.quantity}</span>
                    <button
                      onClick={() => handleIncrease(item.dish.id)}
                      className="cart-qty-button"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total-row">
                <span className="total-label">Tổng cộng</span>
                <span className="total-price">{formatPrice(totalPrice)}</span>
              </div>
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="submit-order-button"
              >
                {isSubmitting ? 'Đang đặt món...' : 'Xác nhận đặt món'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <p>{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
