import { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Plus, Minus, ArrowLeft, X, ChevronRight, Trash2 } from 'lucide-react';
import { useDishes, useCreateOrder, useCreateOrderItem, useOrders, useOrderItems } from '../../hooks/useApi';
import { useCartStore } from '../../stores/cartStore';
import type { Dish, OrderRead, OrderItemRead } from '../../types';
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

// Order item status configuration
const ITEM_STATUS_CONFIG = {
  1: { label: 'Chờ xác nhận', color: 'item-status-pending' },
  2: { label: 'Đang nấu', color: 'item-status-cooking' },
  3: { label: 'Sẵn sàng', color: 'item-status-ready' },
  4: { label: 'Đã phục vụ', color: 'item-status-served' },
};

export default function GuestOrderPage() {
  const [searchParams] = useSearchParams();
  const { tableId: tableIdParam } = useParams<{ tableId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Support both path parameter (/order/5) and query parameter (/order?tableId=5)
  const tableId = parseInt(tableIdParam || searchParams.get('tableId') || '0');

  const [activeCategory, setActiveCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeOrder, setActiveOrder] = useState<OrderRead | null>(null);
  const [orderedItems, setOrderedItems] = useState<OrderItemRead[]>([]);

  const { data: dishes, isLoading, error } = useDishes();
  const { data: orders } = useOrders({ table_id: tableId });
  const { items, addItem, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCartStore();

  // Fetch order items for the active order
  const { data: fetchedOrderItems } = useOrderItems(
    activeOrder ? { order_id: activeOrder.id } : undefined
  );

  const createOrder = useCreateOrder();
  const createOrderItem = useCreateOrderItem();

  // Check for active orders (status_id 1-4, not paid/cancelled)
  useEffect(() => {
    if (orders && orders.length > 0) {
      const active = orders.find(order =>
        order.status_id && order.status_id >= 1 && order.status_id <= 4
      );
      setActiveOrder(active || null);
    } else {
      setActiveOrder(null);
    }
  }, [orders]);

  // Update ordered items when fetched
  useEffect(() => {
    if (fetchedOrderItems) {
      setOrderedItems(fetchedOrderItems);
    } else {
      setOrderedItems([]);
    }
  }, [fetchedOrderItems]);

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
    // Validation
    if (!tableId) {
      showToastNotification('Table not found');
      return;
    }

    if (items.length === 0) {
      showToastNotification('Cart is empty');
      return;
    }

    try {
      setIsSubmitting(true);

      // STEP 1: Check if active order exists for this table
      let orderId: number;

      if (activeOrder) {
        // Branch A: Active order exists - append items to existing order
        orderId = activeOrder.id;
        console.log('Appending to existing order:', orderId);
      } else {
        // Branch B: No active order - create new order
        console.log('Creating new order for table:', tableId);
        const orderResponse = await createOrder.mutateAsync({
          table_id: tableId,
          status_id: 1, // Pending
        });
        orderId = orderResponse.data.id;
        console.log('New order created:', orderId);
      }

      // STEP 2: Loop through cart items and add each to the order
      console.log('Adding items to order:', items.length);
      for (const item of items) {
        await createOrderItem.mutateAsync({
          order_id: orderId,
          dish_id: item.dish.id,
          quantity: item.quantity,
          status_id: 1, // Pending
        });
      }

      // STEP 3: On Success
      // 3.1: Clear the local cart state
      clearCart();
      console.log('Cart cleared');

      // 3.2: Trigger refetch of activeOrder using QueryClient invalidate
      // This will cause the ordered items to appear in "Kitchen Status" section
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', { table_id: tableId }] });
      queryClient.invalidateQueries({ queryKey: ['orderItems'] });
      queryClient.invalidateQueries({ queryKey: ['orderItems', { order_id: orderId }] });
      console.log('Queries invalidated - UI will auto-update');

      // 3.3: Show success toast
      showToastNotification('Order sent to kitchen!');

      // 3.4: Close cart modal (UI will automatically show items in "Kitchen Status")
      // Small delay to allow user to see the success message
      setTimeout(() => {
        setShowCart(false);
      }, 800);

      // Note: No redirect - user stays on page and sees items move to "Previously Ordered"
    } catch (err) {
      console.error('Failed to submit order:', err);
      showToastNotification('Failed to send order. Please try again.');
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

  const getItemStatusInfo = (statusId: number) => {
    return ITEM_STATUS_CONFIG[statusId as keyof typeof ITEM_STATUS_CONFIG] || ITEM_STATUS_CONFIG[1];
  };

  // Calculate total for ordered items
  const calculateOrderedTotal = () => {
    return orderedItems.reduce((total, item) => {
      const price = parseFloat(item.dish.price);
      return total + (price * item.quantity);
    }, 0);
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const orderedTotal = calculateOrderedTotal();
  const grandTotal = totalPrice + orderedTotal;

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
      {totalItems > 0 ? (
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
      ) : activeOrder ? (
        <button
          onClick={() => navigate(`/my-order/${tableId}`)}
          className="floating-cart-button view-order"
        >
          <div className="cart-button-content">
            <div className="cart-action">
              <span className="cart-text">Xem đơn hàng của tôi</span>
              <ChevronRight size={20} />
            </div>
          </div>
        </button>
      ) : null}

      {/* Cart Modal */}
      {showCart && (
        <div className="cart-modal-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2 className="cart-title">Đơn hàng của bạn</h2>
              <button onClick={() => setShowCart(false)} className="close-button">
                <X size={24} />
              </button>
            </div>

            <div className="cart-content">
              {/* NEW ITEMS SECTION - Ready to Send */}
              {items.length > 0 && (
                <div className="new-items-section">
                  <div className="section-header-new">
                    <h3 className="section-title-new">Ready to Send</h3>
                    <span className="section-count">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                  </div>
                  <div className="new-items-list">
                    {items.map((item) => (
                      <div key={item.dish.id} className="new-item-card">
                        <div className="new-item-image">
                          <img
                            src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=120&q=80"
                            alt={item.dish.name}
                            className="item-img"
                          />
                        </div>
                        <div className="new-item-details">
                          <h4 className="new-item-name">{item.dish.name}</h4>
                          <p className="new-item-meta">× {item.quantity}</p>
                        </div>
                        <div className="new-item-price-action">
                          <span className="new-item-price">{formatPrice(parseFloat(item.dish.price) * item.quantity)}</span>
                          <button
                            onClick={() => removeItem(item.dish.id)}
                            className="trash-button"
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="section-footer-new">
                    <button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                      className="send-to-kitchen-button"
                    >
                      {isSubmitting ? 'Sending...' : 'Send to Kitchen'}
                    </button>
                  </div>
                </div>
              )}

              {/* VISUAL SEPARATOR */}
              {items.length > 0 && orderedItems.length > 0 && (
                <div className="cart-separator">
                  <div className="separator-line"></div>
                </div>
              )}

              {/* ORDERED ITEMS SECTION - Kitchen Status */}
              {orderedItems.length > 0 && (
                <div className="ordered-items-section">
                  <div className="section-header-ordered">
                    <h3 className="section-title-ordered">Kitchen Status</h3>
                    <span className="section-count">{orderedItems.length} {orderedItems.length === 1 ? 'item' : 'items'}</span>
                  </div>
                  <div className="ordered-items-list">
                    {orderedItems.map((item) => {
                      const statusInfo = getItemStatusInfo(item.status_id);
                      return (
                        <div key={item.id} className="ordered-item-card">
                          <div className="ordered-item-details">
                            <h4 className="ordered-item-name">{item.dish.name}</h4>
                            <p className="ordered-item-meta">× {item.quantity}</p>
                          </div>
                          <span className={`status-badge status-${item.status_id}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* EMPTY STATE */}
              {items.length === 0 && orderedItems.length === 0 && (
                <div className="cart-empty-state">
                  <ShoppingCart size={48} className="empty-icon" />
                  <p className="empty-text">Chưa có món nào</p>
                </div>
              )}
            </div>

            {/* CART FOOTER */}
            {(items.length > 0 || orderedItems.length > 0) && (
              <div className="cart-footer">
                <div className="cart-total-summary">
                  <div className="cart-total-row grand-total">
                    <span className="total-label">Total Amount</span>
                    <span className="total-price">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>
            )}
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
