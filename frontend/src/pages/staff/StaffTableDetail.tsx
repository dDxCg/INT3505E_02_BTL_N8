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
  getTableById,
  getOrderByTable,
  getOrderItems,
  updateItemStatus,
  deleteOrderItem,
} from '../../services/api';
import type { TableRead, OrderRead, OrderItemRead } from '../../types/schema';
import { toast } from 'react-toastify';

export default function StaffTableDetail() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();

  // State
  const [table, setTable] = useState<TableRead | null>(null);
  const [activeOrder, setActiveOrder] = useState<OrderRead | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // ============================================
  // FETCH DATA WITH AUTO-REFRESH
  // ============================================

  const fetchTableData = async () => {
    if (!tableId) return;

    try {
      const tableIdNum = parseInt(tableId);

      // Fetch table info and active orders
      const [tableData, orders] = await Promise.all([
        getTableById(tableIdNum),
        getOrderByTable(tableIdNum, 1), // status_id=1 (pending/active)
      ]);

      setTable(tableData);

      if (orders.length > 0) {
        const order = orders[0];
        setActiveOrder(order);

        // Fetch order items
        const items = await getOrderItems(order.id);
        setOrderItems(items);
      } else {
        setActiveOrder(null);
        setOrderItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch table data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData();

    // Auto-refresh every 3 seconds
    const interval = setInterval(() => {
      fetchTableData();
    }, 3000);

    return () => clearInterval(interval);
  }, [tableId]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleServeItem = async (itemId: number) => {
    try {
      setActionLoading(itemId);
      await updateItemStatus(itemId, { status_id: 2 }); // 2 = Served
      await fetchTableData(); // Refresh data
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
      await deleteOrderItem(itemId);
      await fetchTableData(); // Refresh data
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

      {/* Main Container with Responsive Grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN (Span-2 on Desktop) - Header + Order List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Desktop-Only Header Card */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <button
                onClick={() => navigate('/staff')}
                className="mb-4 p-2 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Quay lại</span>
              </button>

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Bàn #{table.number}</h1>
                  <p className="text-sm text-gray-500 mt-1">{table.seats} chỗ ngồi</p>
                </div>
                <span className={`text-sm font-medium px-4 py-2 rounded-full ${tableStatus.color}`}>
                  {tableStatus.label}
                </span>
              </div>
            </div>

            {/* Order List Content */}
            {!activeOrder ? (
              // No Active Order
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Bàn đang trống
                </h2>
                <p className="text-gray-600">Chưa có order nào đang active</p>
              </div>
            ) : (
              <div className="space-y-4">
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

                {/* Empty State */}
                {pendingItems.length === 0 && servedItems.length === 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Chưa có món nào
                    </h2>
                    <p className="text-gray-600">
                      Order đã tạo nhưng chưa có món được gọi
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (Span-1 on Desktop) - Bill Summary & Actions */}
          {activeOrder && orderItems.length > 0 && (
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Hóa đơn</h2>

                  {/* Order Items Summary */}
                  <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-start text-sm pb-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 leading-tight">{item.dish.name}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {formatPrice(item.dish.price)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900 ml-3">
                          {formatPrice(item.dish.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Breakdown Section */}
                  <div className="border-t-2 border-gray-200 pt-4 mb-6 space-y-3">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Tạm tính</span>
                      <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                    </div>

                    {/* Tax */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">VAT (10%)</span>
                      <span className="font-medium text-gray-900">{formatPrice(taxAmount)}</span>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="text-base font-semibold text-gray-700">Tổng cộng</span>
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleGoToPayment}
                    className="w-full px-6 py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    <Printer className="w-5 h-5" />
                    Đi đến thanh toán
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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
