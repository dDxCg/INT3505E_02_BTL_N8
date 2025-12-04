import { useEffect, useState } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, ChefHat, Loader2, UtensilsCrossed } from 'lucide-react';
import { useOrders, useOrderItems, useOrderStatuses, useOrderItemStatuses } from '../../hooks/useApi';
import type { OrderRead, OrderItemRead } from '../../types';
import './my-order-styles.css';

// Status configuration with colors, icons, and estimated times
const STATUS_CONFIG = {
  1: { label: 'Chờ xác nhận', color: 'status-pending', icon: Clock, estimatedTime: '2-3 phút', step: 1 },
  2: { label: 'Đang nấu', color: 'status-cooking', icon: ChefHat, estimatedTime: '15-20 phút', step: 2 },
  3: { label: 'Đã phục vụ', color: 'status-served', icon: CheckCircle, estimatedTime: 'Đang thưởng thức', step: 3 },
  4: { label: 'Hoàn thành', color: 'status-completed', icon: UtensilsCrossed, estimatedTime: 'Hoàn tất', step: 4 },
};

// Timeline steps configuration
const TIMELINE_STEPS = [
  { id: 1, label: 'Đặt món', shortLabel: 'Đặt', icon: Clock },
  { id: 2, label: 'Đang nấu', shortLabel: 'Nấu', icon: ChefHat },
  { id: 3, label: 'Phục vụ', shortLabel: 'Phục vụ', icon: CheckCircle },
  { id: 4, label: 'Thanh toán', shortLabel: 'Xong', icon: UtensilsCrossed },
];

const ITEM_STATUS_CONFIG = {
  1: { label: 'Chờ', color: 'item-pending' },
  2: { label: 'Nấu', color: 'item-cooking' },
  3: { label: 'Xong', color: 'item-ready' },
  4: { label: 'Phục vụ', color: 'item-served' },
};

export default function MyOrderPage() {
  const [searchParams] = useSearchParams();
  const { tableId: tableIdParam } = useParams<{ tableId?: string }>();
  const navigate = useNavigate();

  // Support both path and query parameters
  const tableId = parseInt(tableIdParam || searchParams.get('tableId') || '0');

  const [activeOrder, setActiveOrder] = useState<OrderRead | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemRead[]>([]);

  // Fetch orders for this table
  const { data: orders, isLoading: ordersLoading } = useOrders({ table_id: tableId });

  // Fetch order items if we have an active order
  const { data: items, isLoading: itemsLoading } = useOrderItems(
    activeOrder ? { order_id: activeOrder.id } : undefined
  );

  const { data: orderStatuses } = useOrderStatuses();
  const { data: itemStatuses } = useOrderItemStatuses();

  // Find active order (not paid/cancelled)
  useEffect(() => {
    if (orders && orders.length > 0) {
      // Filter for active orders (status_id not 5 (paid) or 6 (cancelled))
      const active = orders.find(order =>
        order.status_id && order.status_id >= 1 && order.status_id <= 4
      );
      setActiveOrder(active || null);
    }
  }, [orders]);

  // Update order items when fetched
  useEffect(() => {
    if (items) {
      setOrderItems(items);
    }
  }, [items]);

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const price = parseFloat(item.dish.price);
      return total + (price * item.quantity);
    }, 0);
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numPrice);
  };

  const getStatusInfo = (statusId: number) => {
    return STATUS_CONFIG[statusId as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[1];
  };

  const getItemStatusInfo = (statusId: number) => {
    return ITEM_STATUS_CONFIG[statusId as keyof typeof ITEM_STATUS_CONFIG] || ITEM_STATUS_CONFIG[1];
  };

  const handleBackToMenu = () => {
    if (tableId) {
      navigate(`/order/${tableId}`);
    } else {
      navigate('/order');
    }
  };

  if (!tableId) {
    return (
      <div className="my-order-page">
        <div className="error-state">
          <div className="error-icon">🍽️</div>
          <h1 className="error-title">Không tìm thấy bàn</h1>
          <p className="error-text">Vui lòng quét mã QR để xem đơn hàng</p>
        </div>
      </div>
    );
  }

  if (ordersLoading) {
    return (
      <div className="my-order-page">
        <div className="loading-state">
          <Loader2 className="loading-spinner" size={40} />
          <p>Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!activeOrder) {
    return (
      <div className="my-order-page">
        <header className="order-header">
          <button onClick={handleBackToMenu} className="back-button">
            <ArrowLeft size={20} />
          </button>
          <h1 className="page-title">Đơn hàng của tôi</h1>
          <div className="header-spacer"></div>
        </header>

        <div className="empty-order-state">
          <div className="empty-icon">📋</div>
          <h2 className="empty-title">Chưa có đơn hàng</h2>
          <p className="empty-text">Bạn chưa đặt món nào. Hãy quay lại menu để chọn món!</p>
          <button onClick={handleBackToMenu} className="back-to-menu-button">
            Quay lại Menu
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(activeOrder.status_id);
  const StatusIcon = statusInfo.icon;
  const total = calculateTotal();

  return (
    <div className="my-order-page">
      {/* Header */}
      <header className="order-header">
        <button onClick={handleBackToMenu} className="back-button">
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title">Đơn hàng của tôi</h1>
        <div className="header-spacer"></div>
      </header>

      <main className="order-content">
        {/* Table Info */}
        <div className="table-info-card">
          <span className="table-info-label">Bàn số</span>
          <span className="table-info-number">{activeOrder.table?.number || tableId}</span>
        </div>

        {/* Status Banner with Timeline */}
        <div className="status-banner-container">
          <div className={`status-banner ${statusInfo.color}`}>
            <div className="status-header">
              <div className="status-icon-wrapper">
                <StatusIcon size={32} />
              </div>
              <div className="status-content">
                <h2 className="status-title">Trạng thái đơn hàng</h2>
                <p className="status-label">{statusInfo.label}</p>
                <p className="status-time">
                  <Clock size={14} />
                  <span>{statusInfo.estimatedTime}</span>
                </p>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="progress-timeline">
              <div className="timeline-track">
                <div
                  className="timeline-progress"
                  style={{ width: `${((statusInfo.step - 1) / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                ></div>
              </div>

              <div className="timeline-steps">
                {TIMELINE_STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = step.id === statusInfo.step;
                  const isCompleted = step.id < statusInfo.step;
                  const stepClass = isActive ? 'active' : isCompleted ? 'completed' : 'pending';

                  return (
                    <div key={step.id} className={`timeline-step ${stepClass}`}>
                      <div className="step-dot-wrapper">
                        <div className="step-dot">
                          <StepIcon size={16} />
                        </div>
                      </div>
                      <span className="step-label">{step.shortLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="order-items-section">
          <h3 className="section-title">Chi tiết đơn hàng</h3>

          {itemsLoading ? (
            <div className="items-loading">
              <Loader2 className="loading-spinner" size={24} />
              <p>Đang tải món...</p>
            </div>
          ) : orderItems.length === 0 ? (
            <div className="no-items">
              <p>Không có món nào trong đơn hàng</p>
            </div>
          ) : (
            <div className="order-items-list">
              {orderItems.map((item, index) => {
                const itemStatusInfo = getItemStatusInfo(item.status_id);
                return (
                  <div
                    key={item.id}
                    className="order-item"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="item-image">
                      <img
                        src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80"
                        alt={item.dish.name}
                        loading="lazy"
                      />
                    </div>
                    <div className="item-details">
                      <div className="item-header">
                        <h4 className="item-name">{item.dish.name}</h4>
                        {item.status_id && (
                          <span className={`item-status-badge ${itemStatusInfo.color}`}>
                            {itemStatusInfo.label}
                          </span>
                        )}
                      </div>
                      <div className="item-footer">
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">
                          {formatPrice(parseFloat(item.dish.price) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Total Summary */}
        <div className="order-summary">
          <div className="summary-row">
            <span className="summary-label">Tạm tính</span>
            <span className="summary-value">{formatPrice(total)}</span>
          </div>
          <div className="summary-row total-row">
            <span className="summary-label">Tổng cộng</span>
            <span className="summary-total">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="order-actions">
          <button onClick={handleBackToMenu} className="action-button secondary">
            Thêm món
          </button>
        </div>
      </main>
    </div>
  );
}
