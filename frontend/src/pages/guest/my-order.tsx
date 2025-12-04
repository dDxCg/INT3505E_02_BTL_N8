import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, ChefHat, Loader2, UtensilsCrossed, RefreshCw, Plus } from 'lucide-react';
import { useOrders, useOrderItems, useOrderStatuses, useOrderItemStatuses } from '../../hooks/useApi';
import { useCartStore } from '../../stores/cartStore';
import { calculateTimelineStep, getTimelineStepLabel, getTimelineStepEstimate, TIMELINE_STEP } from '../../lib/order-utils';
import type { OrderRead, OrderItemRead } from '../../types';
import './my-order-styles.css';

// Status configuration with colors, icons, and estimated times
const STATUS_CONFIG = {
  1: { label: 'Chờ xác nhận', color: 'status-pending', icon: Clock, estimatedTime: '2-3 phút', step: 1 },
  2: { label: 'Đang nấu', color: 'status-cooking', icon: ChefHat, estimatedTime: '15-20 phút', step: 2 },
  3: { label: 'Đã phục vụ', color: 'status-served', icon: CheckCircle, estimatedTime: 'Đang thưởng thức', step: 3 },
  4: { label: 'Hoàn thành', color: 'status-completed', icon: UtensilsCrossed, estimatedTime: 'Hoàn tất', step: 4 },
};

// Timeline steps configuration (3 steps - "Xong" is implicit reset state)
const TIMELINE_STEPS = [
  { id: 1, label: 'Đặt món', shortLabel: 'Đặt', icon: Clock, color: 'orange' },
  { id: 2, label: 'Đang nấu', shortLabel: 'Nấu', icon: ChefHat, color: 'blue' },
  { id: 3, label: 'Đã phục vụ', shortLabel: 'Phục vụ', icon: CheckCircle, color: 'green' },
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showResetNotification, setShowResetNotification] = useState(false);
  const [showWaitingState, setShowWaitingState] = useState(false);
  const hasShownResetRef = useRef(false);
  const noOrderTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get cart store functions and items
  const { clearCart, items: cartItems } = useCartStore();

  // Fetch orders for this table with refetch capability
  // Always enabled when we have a valid tableId
  // Auto-polling every 5 seconds to detect when staff closes the table
  const {
    data: orders,
    isLoading: ordersLoading,
    refetch: refetchOrders,
    isFetching: ordersFetching
  } = useOrders(
    { table_id: tableId },
    {
      enabled: !!tableId && tableId > 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      refetchInterval: 5000, // Poll every 5 seconds to detect table closure
      refetchIntervalInBackground: true, // Keep polling even when tab is in background
    }
  );

  // Fetch order items if we have an active order with refetch capability
  const {
    data: items,
    isLoading: itemsLoading,
    refetch: refetchItems,
    isFetching: itemsFetching
  } = useOrderItems(
    activeOrder ? { order_id: activeOrder.id } : undefined,
    {
      enabled: !!activeOrder,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      refetchInterval: 5000, // Poll every 5 seconds to update item statuses
      refetchIntervalInBackground: true,
    }
  );

  const { data: orderStatuses } = useOrderStatuses();
  const { data: itemStatuses } = useOrderItemStatuses();

  // Find active order (not paid/cancelled)
  useEffect(() => {
    if (orders && orders.length > 0) {
      // Filter for active orders (status_id 1-2: pending/cooking)
      // Status 3+ means completed/paid/cancelled
      const active = orders.find(order =>
        order.status_id && order.status_id >= 1 && order.status_id <= 2
      );
      setActiveOrder(active || null);
    } else if (orders && orders.length === 0) {
      setActiveOrder(null);
    }
  }, [orders]);

  // AUTO-RESET: Detect when staff closes the table and reset the guest view
  // Uses debouncing to prevent false positives during loading
  useEffect(() => {
    // Clear any existing timer when dependencies change
    if (noOrderTimerRef.current) {
      clearTimeout(noOrderTimerRef.current);
      noOrderTimerRef.current = null;
    }

    // STRICT GUARDS: Do NOT reset while loading or fetching
    if (ordersLoading || ordersFetching) {
      console.log('[GUEST MY ORDER] Skipping reset check - data is loading');
      setShowWaitingState(false); // Hide waiting state while loading
      return;
    }

    // Skip if we've already shown the reset notification for this session
    if (hasShownResetRef.current) return;

    // Guard: Must have valid tableId and orders data
    if (!tableId || !orders) {
      console.log('[GUEST MY ORDER] Skipping reset check - no tableId or orders data');
      return;
    }

    // Check if we have any orders at all
    if (orders.length === 0) {
      // No orders exist for this table yet - this is normal for new guests
      console.log('[GUEST MY ORDER] No orders exist yet - showing waiting state');
      setShowWaitingState(true);
      return;
    }

    // Check if any order has been completed/paid/cancelled (status_id >= 3)
    const hasCompletedOrder = orders.some(order =>
      order.status_id && order.status_id >= 3
    );

    // Check if there's no active order (status_id 1-2)
    const noActiveOrder = !activeOrder;

    // If there's no active order but we have orders, show waiting state first
    if (hasCompletedOrder && noActiveOrder) {
      console.log('[GUEST MY ORDER] No active order detected - starting debounce timer');
      setShowWaitingState(true);

      // DEBOUNCE: Wait 2 seconds before triggering reset
      // This prevents false positives and gives a smoother UX
      noOrderTimerRef.current = setTimeout(() => {
        console.log('[GUEST MY ORDER] Table closed confirmed after 2s - Auto-resetting...');
        console.log('- Orders:', orders.map(o => ({ id: o.id, status: o.status_id })));

        // Clear cart
        clearCart();

        // Clear any localStorage cart data
        try {
          localStorage.removeItem('restaurant-cart-storage');
        } catch (error) {
          console.error('Failed to clear cart storage:', error);
        }

        // Hide waiting state and show reset notification
        setShowWaitingState(false);
        setShowResetNotification(true);
        hasShownResetRef.current = true;

        // Redirect to order page after 3 seconds
        setTimeout(() => {
          navigate(`/order/${tableId}`);
        }, 3000);
      }, 2000); // 2 second debounce
    } else {
      // Active order exists, hide waiting state
      setShowWaitingState(false);
    }

    // Cleanup function
    return () => {
      if (noOrderTimerRef.current) {
        clearTimeout(noOrderTimerRef.current);
        noOrderTimerRef.current = null;
      }
    };
  }, [activeOrder, orders, ordersLoading, ordersFetching, tableId, clearCart, navigate]);

  // Update order items when fetched
  useEffect(() => {
    if (items) {
      setOrderItems(items);
    }
  }, [items]);

  // Refresh handler - refetches both orders and items
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchOrders();
      if (activeOrder) {
        await refetchItems();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Pull-to-refresh functionality
  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    const threshold = 80;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY === 0 && startY > 0) {
        currentY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      if (currentY - startY > threshold) {
        handleRefresh();
      }
      startY = 0;
      currentY = 0;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeOrder]);

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

  // LOADING STATE: Show skeleton/spinner while initial data loads
  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
          <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-5 py-4">
              <button onClick={handleBackToMenu} className="p-1.5 -ml-1.5">
                <ArrowLeft size={22} className="text-[#4a4238]" />
              </button>
              <h1 className="font-serif text-xl font-semibold text-gray-800">Đơn hàng của tôi</h1>
              <div className="w-9"></div>
            </div>
          </header>

          <div className="flex flex-col items-center justify-center min-h-[70vh] px-5">
            <Loader2 className="animate-spin text-[#ea580c] mb-4" size={52} />
            <h2 className="font-serif text-2xl font-semibold text-gray-800 mb-2">Đang tải...</h2>
            <p className="text-sm text-gray-600">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  // WAITING STATE: No active order, but might be temporary
  // Show friendly message before triggering reset
  if (showWaitingState && !activeOrder) {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
          <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-5 py-4">
              <button onClick={handleBackToMenu} className="p-1.5 -ml-1.5">
                <ArrowLeft size={22} className="text-[#4a4238]" />
              </button>
              <h1 className="font-serif text-xl font-semibold text-gray-800">Đơn hàng của tôi</h1>
              <div className="w-9"></div>
            </div>
          </header>

          <div className="flex flex-col items-center justify-center min-h-[70vh] px-5 text-center">
            <Clock className="text-[#ea580c] mb-5 animate-pulse" size={68} />
            <h2 className="font-serif text-2xl font-semibold text-gray-800 mb-3">Đang kiểm tra...</h2>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed max-w-xs">
              Đang tìm kiếm đơn hàng của bạn.<br />
              Nếu bàn đã đóng, bạn sẽ được chuyển đến thực đơn.
            </p>
            <div className="flex gap-2.5">
              <span className="w-2.5 h-2.5 bg-[#ea580c] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="w-2.5 h-2.5 bg-[#ea580c] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2.5 h-2.5 bg-[#ea580c] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY STATE: Definitely no order exists (for new guests)
  if (!activeOrder && !showWaitingState) {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
          <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-5 py-4">
              <button onClick={handleBackToMenu} className="p-1.5 -ml-1.5">
                <ArrowLeft size={22} className="text-[#4a4238]" />
              </button>
              <h1 className="font-serif text-xl font-semibold text-gray-800">Đơn hàng của tôi</h1>
              <div className="w-9"></div>
            </div>
          </header>

          <div className="flex flex-col items-center justify-center min-h-[70vh] px-5 text-center">
            <div className="text-7xl mb-5">🍽️</div>
            <h2 className="font-serif text-3xl font-bold text-gray-800 mb-3">Chưa có đơn hàng</h2>
            <p className="text-base text-gray-600 mb-8 max-w-sm leading-relaxed">
              Bạn chưa đặt món nào.<br />
              Hãy khám phá thực đơn nhé!
            </p>
            <button
              onClick={handleBackToMenu}
              className="px-10 py-4 bg-[#4a4238] hover:bg-[#3a3228] text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Xem thực đơn
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate the current timeline step based on cart items, active order, and order items
  const currentStep = calculateTimelineStep(cartItems, activeOrder, orderItems);

  // Map timeline step to visual step (1-3, ignoring FINISHED which triggers reset)
  const visualStep = currentStep === TIMELINE_STEP.FINISHED ? 3 : currentStep;

  // Get the appropriate icon for current step
  const getStepIcon = (step: number) => {
    switch (step) {
      case TIMELINE_STEP.PLACING: return Clock;
      case TIMELINE_STEP.COOKING: return ChefHat;
      case TIMELINE_STEP.SERVED: return CheckCircle;
      case TIMELINE_STEP.FINISHED: return CheckCircle;
      default: return Clock;
    }
  };

  const StatusIcon = getStepIcon(currentStep);
  const total = calculateTotal();

  // Get status message and color based on current step
  const getStatusMessage = () => {
    switch (currentStep) {
      case TIMELINE_STEP.PLACING:
        return {
          title: 'Sẵn sàng gửi',
          message: 'Bạn có món trong giỏ chờ gửi đến bếp',
          badge: 'Đang đặt món',
          color: 'orange'
        };
      case TIMELINE_STEP.COOKING:
        return {
          title: 'Đang nấu',
          message: 'Bếp đang chuẩn bị món ăn của bạn',
          badge: 'Bếp đang chuẩn bị món...',
          color: 'blue'
        };
      case TIMELINE_STEP.SERVED:
        return {
          title: 'Đã phục vụ',
          message: 'Món ăn của bạn đã sẵn sàng',
          badge: 'Chúc ngon miệng!',
          color: 'green'
        };
      default:
        return {
          title: 'Đơn hàng',
          message: '',
          badge: '',
          color: 'blue'
        };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="min-h-screen w-full bg-gray-100 flex justify-center items-start pt-0 sm:pt-10">
      <div className="w-full max-w-md bg-white shadow-2xl min-h-screen sm:min-h-[90vh] sm:rounded-2xl relative overflow-hidden pb-32">
        {/* Reset Notification Overlay */}
        {showResetNotification && (
          <div className="reset-notification-overlay">
            <div className="reset-notification-content">
              <div className="reset-icon-wrapper">
                <CheckCircle size={64} className="reset-icon" />
              </div>
              <h2 className="reset-title">Bàn đã đóng</h2>
              <p className="reset-message">
                Bàn của bạn đã được đóng bởi nhân viên.<br />
                Sẵn sàng cho đơn hàng mới!
              </p>
              <div className="reset-spinner"></div>
            </div>
          </div>
        )}

        {/* Elegant Restaurant Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={handleBackToMenu} className="p-1.5 -ml-1.5 hover:bg-gray-50 rounded-full transition">
              <ArrowLeft size={22} className="text-[#4a4238]" />
            </button>
            <h1 className="font-serif text-xl font-semibold text-gray-800">Đơn hàng của tôi</h1>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
              <span className="text-xs text-gray-600">Bàn</span>
              <span className="text-sm font-bold text-gray-900">{activeOrder.table?.number || tableId}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-5 py-5 space-y-6">
          {/* Order Status Message */}
          {statusMessage.badge && (
            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <p className="text-sm text-amber-900 font-medium">{statusMessage.badge}</p>
            </div>
          )}

          {/* Elegant Timeline - Brown/Orange Theme */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 shadow-sm border border-amber-100">
            <h3 className="font-serif text-base font-semibold text-gray-800 mb-4">Trạng thái đơn hàng</h3>

            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-[#4a4238] to-[#ea580c] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${((visualStep - 1) / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                ></div>
              </div>

              {/* Timeline Steps */}
              <div className="relative flex justify-between">
                {TIMELINE_STEPS.map((step) => {
                  const StepIcon = step.icon;
                  const isActive = step.id === visualStep;
                  const isCompleted = step.id < visualStep;

                  return (
                    <div key={step.id} className="flex flex-col items-center z-10">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted ? 'bg-[#4a4238] text-white shadow-lg' :
                        isActive ? 'bg-[#ea580c] text-white shadow-lg ring-4 ring-orange-100' :
                        'bg-gray-200 text-gray-400'
                      } ${isActive && currentStep === TIMELINE_STEP.PLACING ? 'animate-pulse' : ''}`}>
                        {isCompleted ? <CheckCircle size={18} /> : <StepIcon size={18} />}
                      </div>
                      <span className={`mt-2 text-xs font-medium transition-colors ${
                        isCompleted ? 'text-[#4a4238]' :
                        isActive ? 'text-[#ea580c]' :
                        'text-gray-400'
                      }`}>
                        {step.shortLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Send to Kitchen Button - Only show if in PLACING step */}
            {currentStep === TIMELINE_STEP.PLACING && cartItems.length > 0 && (
              <div className="mt-5 pt-4 border-t border-amber-200">
                <button
                  onClick={handleBackToMenu}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ea580c] hover:bg-[#dc2626] text-white font-semibold rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <ChefHat size={20} />
                  <span>Gửi đến bếp</span>
                </button>
              </div>
            )}
          </div>

          {/* Order Items - Elegant Food Cards */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-gray-800">Món đã gọi</h3>

            {itemsLoading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="animate-spin text-[#ea580c] mb-3" size={36} />
                <p className="text-sm text-gray-600">Đang tải món ăn...</p>
              </div>
            ) : orderItems.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl">
                <p className="text-gray-500">Chưa có món nào trong đơn hàng</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item, index) => {
                  const itemStatusInfo = getItemStatusInfo(item.status_id);
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 bg-white rounded-xl border border-gray-200 p-3.5 hover:shadow-lg hover:border-amber-200 transition-all duration-200"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Image */}
                      <img
                        src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=96&h=96&fit=crop"
                        alt={item.dish.name}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-sm"
                        loading="lazy"
                      />

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-base leading-tight">{item.dish.name}</h4>
                            {item.status_id && (
                              <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                                item.status_id === 1 ? 'bg-amber-100 text-amber-800' :
                                item.status_id === 2 ? 'bg-orange-100 text-orange-800' :
                                item.status_id === 3 ? 'bg-emerald-100 text-emerald-800' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {itemStatusInfo.label}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">Số lượng: x{item.quantity}</p>
                        </div>

                        {/* Price - Bold Orange */}
                        <div className="mt-2">
                          <span className="text-lg font-bold text-[#ea580c]">
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

          {/* Spacer for sticky footer */}
          <div className="h-32"></div>
        </main>

        {/* Sticky Footer - Total & Action Button - Centered on Desktop */}
        <div className="fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 bg-white border-t border-gray-200 px-5 py-4 shadow-2xl z-40 sm:rounded-b-2xl">
          {/* Total Row */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-medium text-gray-600">Tổng cộng</span>
            <span className="text-2xl font-bold text-[#ea580c]">{formatPrice(total)}</span>
          </div>

          {/* Main Action Button - Dark Brown */}
          <button
            onClick={handleBackToMenu}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-[#4a4238] hover:bg-[#3a3228] text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            <span>Gọi thêm món</span>
          </button>
        </div>
      </div>
    </div>
  );
}
