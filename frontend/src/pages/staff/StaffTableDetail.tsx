import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  X,
  Printer,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  useTable,
  useOrders,
  useOrderItems,
  useUpdateOrderItem,
  useDeleteOrderItem,
} from '../../hooks/useApi';
import type { TableRead, OrderRead, OrderItemRead } from '../../types/schema';
import { toast } from 'react-toastify';

export default function StaffTableDetail() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const tableIdNum = tableId ? parseInt(tableId) : 0;

  // State
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Fetch table data
  const { data: table, isLoading: tableLoading } = useTable(tableIdNum);

  // Fetch orders for this table (status 1 or 2: pending/cooking)
  const { data: ordersData, isLoading: ordersLoading } = useOrders(
    { table_id: tableIdNum },
    {
      enabled: !!tableIdNum,
      refetchInterval: 3000, // Auto-refresh every 3 seconds
    }
  );

  // Get the active order (status_id 1 or 2)
  const activeOrder = ordersData?.find(order =>
    order.status_id && order.status_id >= 1 && order.status_id <= 2
  ) || null;

  // Fetch order items if there's an active order
  const { data: orderItems = [], isLoading: itemsLoading } = useOrderItems(
    activeOrder ? { order_id: activeOrder.id } : undefined,
    {
      enabled: !!activeOrder,
      refetchInterval: 3000, // Auto-refresh every 3 seconds
    }
  );

  const loading = tableLoading || ordersLoading || itemsLoading;

  // Mutations
  const updateOrderItem = useUpdateOrderItem();
  const deleteOrderItem = useDeleteOrderItem();

  // ============================================
  // HANDLERS
  // ============================================

  const handleServeItem = async (itemId: number) => {
    try {
      setActionLoading(itemId);
      await updateOrderItem.mutateAsync({
        id: itemId,
        data: { status_id: 2 } // 2 = Preparing/Served
      });
      toast.success('Đã lên món thành công');
    } catch (error) {
      console.error('Failed to serve item:', error);
      toast.error('Không thể lên món. Vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelItem = async (itemId: number) => {
    if (!confirm('Bạn có chắc muốn hủy món này?')) return;

    try {
      setActionLoading(itemId);
      await deleteOrderItem.mutateAsync(itemId);
      toast.success('Đã hủy món thành công');
    } catch (error) {
      console.error('Failed to cancel item:', error);
      toast.error('Không thể hủy món. Vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGoToPayment = () => {
    if (!table) return;

    // Navigate to POS page for payment
    navigate('/staff/pos', {
      state: {
        tableId: table.id,
        tableNo: table.number.toString(),
        seats: table.seats,
        status: 'Occupied'
      }
    });
  };

  // ============================================
  // CALCULATIONS
  // ============================================

  const pendingItems = orderItems.filter((item) => item.status_id === 1);
  const servedItems = orderItems.filter((item) => item.status_id === 2);

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0
  );
  const taxRate = 0.1; // 10% VAT
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  const formatPrice = (price: number): string => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!table) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Không tìm thấy bàn</p>
        </div>
      </div>
    );
  }

  // Calculate status for badge
  const getTableStatus = () => {
    if (!activeOrder) return { label: 'Trống', color: 'bg-gray-100 text-gray-700' };
    if (pendingItems.length > 0) return { label: `${pendingItems.length} món chờ`, color: 'bg-orange-100 text-orange-700' };
    if (servedItems.length > 0) return { label: 'Đang dùng', color: 'bg-red-100 text-red-700' };
    return { label: 'Đang phục vụ', color: 'bg-blue-100 text-blue-700' };
  };

  const tableStatus = getTableStatus();

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Only Sticky Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={() => navigate('/staff')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>

            {/* Title & Status Badge */}
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-gray-900">Bàn #{table.number}</h1>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{table.seats} chỗ</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${tableStatus.color}`}>
                  {tableStatus.label}
                </span>
              </div>
            </div>

            {/* Empty space for balance */}
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      {/* Main Container - Edge-to-Edge Fluid Layout */}
      <div className="lg:flex lg:min-h-screen bg-gray-50">
        {/* LEFT COLUMN - Order List (70% Fluid, Expandable) */}
        <div className="lg:flex-1 px-4 md:px-8 lg:px-12 xl:px-16 py-6 bg-white lg:bg-gray-50 overflow-y-auto">
          {/* Desktop-Only Header Card - Full Width */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm p-8 border border-gray-200 mb-6">
            <button
              onClick={() => navigate('/staff')}
              className="mb-6 p-2 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Quay lại</span>
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Bàn #{table.number}</h1>
                <p className="text-base text-gray-500 mt-2">{table.seats} chỗ ngồi</p>
              </div>
              <span className={`text-base font-semibold px-6 py-3 rounded-full ${tableStatus.color}`}>
                {tableStatus.label}
              </span>
            </div>
          </div>

          {/* Order List Content */}
          {!activeOrder ? (
            // No Active Order - Full Width
            <div className="bg-white rounded-xl shadow-sm p-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
              <div className="text-8xl mb-6">🍽️</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Bàn đang trống
              </h2>
              <p className="text-gray-600 text-lg">Chưa có order nào đang active</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-5xl mx-auto">
            {/* Pending Items Section */}
            {pendingItems.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                  Cần xử lý ({pendingItems.length} món)
                </h2>
                <div className="space-y-2">
                  {pendingItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-xl shadow-sm mb-2 border-l-4 border-orange-500"
                    >
                      {/* Item Info */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-base">
                            {item.dish.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <span className="text-gray-500">
                              SL: <span className="font-semibold text-gray-900">{item.quantity}</span>
                            </span>
                            <span className="text-orange-600 font-bold">
                              {formatPrice(item.dish.price * item.quantity)}
                            </span>
                          </div>
                        </div>

                        {/* Subtle Icon Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleServeItem(item.id)}
                            disabled={actionLoading === item.id}
                            className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                            title="Lên món"
                          >
                            {actionLoading === item.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Check className="w-5 h-5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleCancelItem(item.id)}
                            disabled={actionLoading === item.id}
                            className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                            title="Hủy món"
                          >
                            {actionLoading === item.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <X className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Served Items Section */}
            {servedItems.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                  Đã phục vụ ({servedItems.length} món)
                </h2>
                <div className="space-y-2">
                  {servedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-xl shadow-sm mb-2 border border-gray-200 opacity-60"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-700 text-base">
                            {item.dish.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <span className="text-gray-500">SL: {item.quantity}</span>
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Đã lên
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-700 font-bold text-base">
                            {formatPrice(item.dish.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

              </div>
            )}

            {/* Empty State When Order Exists But No Items - Full Width */}
            {activeOrder && pendingItems.length === 0 && servedItems.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
                <div className="text-8xl mb-6">📋</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Chưa có món nào
                </h2>
                <p className="text-gray-600 text-lg">
                  Order đã tạo nhưng chưa có món được gọi
                </p>
              </div>
            )}
        </div>

        {/* RIGHT COLUMN - Invoice Sidebar (30% Fixed, Anchored Right Edge) */}
        {activeOrder && orderItems.length > 0 && (
          <div className="hidden lg:flex lg:flex-col lg:w-[30%] lg:max-w-[600px] lg:min-w-[450px] bg-gradient-to-b from-gray-50 to-gray-100 border-l-4 border-red-200 shadow-[-8px_0_24px_rgba(0,0,0,0.12)] h-screen overflow-y-auto">
            <div className="p-8">
                {/* Invoice Card - Receipt Style */}
                <div className="bg-white rounded-xl shadow-xl border border-gray-300 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Hóa đơn</h2>
                    <div className="flex items-center justify-between text-red-50 text-sm">
                      <span>Bàn #{table.number}</span>
                      <span>{orderItems.length} món</span>
                    </div>
                  </div>

                  {/* Order Items - Receipt Style List - Takes 60% of Available Space */}
                  <div className="px-8 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500" style={{ minHeight: '45vh', maxHeight: 'calc(100vh - 500px)' }}>
                    <div className="space-y-5 pr-2">
                      {orderItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="pb-6 mb-2 border-b-2 border-gray-200 last:border-b-0"
                        >
                          {/* Item Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-gray-400 font-mono text-sm">#{index + 1}</span>
                                <h3 className="font-bold text-gray-900 text-base">{item.dish.name}</h3>
                              </div>
                              {/* Status Badge */}
                              <div className="flex items-center gap-2 mt-2">
                                {item.status_id === 1 ? (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                                    <AlertCircle className="w-3 h-3" />
                                    Chờ xử lý
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                    <Check className="w-3 h-3" />
                                    Đã phục vụ
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Price Calculation */}
                          <div className="mt-4 bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                              <span>Đơn giá</span>
                              <span className="font-mono">{formatPrice(item.dish.price)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                              <span>Số lượng</span>
                              <span className="font-mono">× {item.quantity}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                              <span className="font-semibold text-gray-900">Thành tiền</span>
                              <span className="font-bold text-lg text-gray-900 font-mono">
                                {formatPrice(item.dish.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Section - Compact */}
                  <div className="px-8 py-5 bg-gray-50 border-t-2 border-gray-200">
                    {/* Summary Stats Row - Inline Centered */}
                    <div className="flex items-center justify-center gap-8 mb-5 pb-4 border-b border-gray-200">
                      <div className="text-center">
                        <p className="text-xs text-blue-600 font-medium mb-1">Tổng món</p>
                        <p className="text-2xl font-bold text-blue-700">{orderItems.length}</p>
                      </div>
                      <div className="h-12 w-px bg-gray-300"></div>
                      <div className="text-center">
                        <p className="text-xs text-orange-600 font-medium mb-1">Chờ xử lý</p>
                        <p className="text-2xl font-bold text-orange-700">{pendingItems.length}</p>
                      </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-base">
                        <span className="text-gray-600 font-medium">Tạm tính</span>
                        <span className="font-semibold text-gray-900 font-mono">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-base">
                        <span className="text-gray-600 font-medium">VAT (10%)</span>
                        <span className="font-semibold text-gray-900 font-mono">{formatPrice(taxAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-300">
                        <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                        <span className="text-3xl font-bold text-red-600 font-mono">
                          {formatPrice(totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="px-8 py-6">
                    <button
                      onClick={handleGoToPayment}
                      className="w-full px-8 py-5 bg-red-600 text-white rounded-xl font-bold text-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 active:scale-95"
                    >
                      <Printer className="w-6 h-6" />
                      Đi đến thanh toán
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Mobile-Only Sticky Payment Footer */}
      {activeOrder && orderItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50" style={{ boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)' }}>
          <div className="px-4 py-4">
            {/* Breakdown - Collapsible or always visible */}
            <div className="mb-3 pb-3 border-b border-gray-100 space-y-1">
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>VAT (10%)</span>
                <span>{formatPrice(taxAmount)}</span>
              </div>
            </div>

            {/* Total & Button */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-gray-500">Tổng cộng</div>
                <div className="text-2xl font-bold text-gray-900">{formatPrice(totalAmount)}</div>
              </div>

              <button
                onClick={handleGoToPayment}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-base hover:bg-red-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                <span>Thanh toán</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add padding bottom on mobile for sticky footer */}
      <div className="lg:hidden h-40"></div>
    </div>
  );
}
