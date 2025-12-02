import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Loader2 } from 'lucide-react';
import { getTables, getOrders, getOrderItems } from '../services/api';
import type { TableRead, OrderRead } from '../types/schema';

// ============================================
// TYPES
// ============================================

interface TableWithStatus extends TableRead {
  status: 'available' | 'occupied';
  activeOrder?: OrderRead;
  pendingItemsCount?: number;
  totalAmount?: number;
}

export default function StaffDashboard() {
  const navigate = useNavigate();

  // State
  const [tables, setTables] = useState<TableWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ============================================
  // FETCH DATA
  // ============================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch tables and active orders in parallel
      const [tablesData, ordersData] = await Promise.all([
        getTables(),
        getOrders({ status_id: 1 }), // Only fetch pending/active orders (status_id=1)
      ]);

      // Create a map of tableId -> active order
      const ordersByTable = new Map<number, OrderRead>();
      ordersData.forEach((order) => {
        ordersByTable.set(order.table_id, order);
      });

      // Fetch order items for each active order to count pending items
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const items = await getOrderItems(order.id);
          return { order, items };
        })
      );

      // Create map of orderId -> items
      const itemsByOrder = new Map();
      ordersWithItems.forEach(({ order, items }) => {
        itemsByOrder.set(order.id, items);
      });

      // Map tables with status
      const tablesWithStatus: TableWithStatus[] = tablesData.map((table) => {
        const activeOrder = ordersByTable.get(table.id);

        if (activeOrder) {
          const items = itemsByOrder.get(activeOrder.id) || [];

          // Count pending items (status_id = 1)
          const pendingItemsCount = items.filter(
            (item: any) => item.status_id === 1
          ).length;

          // Calculate total amount
          const totalAmount = items.reduce(
            (sum: number, item: any) => sum + item.dish.price * item.quantity,
            0
          );

          return {
            ...table,
            status: 'occupied' as const,
            activeOrder,
            pendingItemsCount,
            totalAmount,
          };
        }

        return {
          ...table,
          status: 'available' as const,
        };
      });

      setTables(tablesWithStatus);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleTableClick = (tableId: number) => {
    navigate(`/staff/table/${tableId}`);
  };

  // ============================================
  // STATS
  // ============================================

  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const availableCount = tables.filter((t) => t.status === 'available').length;
  const totalPendingItems = tables.reduce(
    (sum, t) => sum + (t.pendingItemsCount || 0),
    0
  );

  // ============================================
  // FORMAT PRICE
  // ============================================

  const formatPrice = (price: number): string => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Staff Dashboard</h1>
              <p className="text-sm text-blue-100">Quản lý nhà hàng</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {tables.length}
              </div>
              <div className="text-sm text-gray-600">Tổng bàn</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {occupiedCount}
              </div>
              <div className="text-sm text-gray-600">Đang phục vụ</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {availableCount}
              </div>
              <div className="text-sm text-gray-600">Bàn trống</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {totalPendingItems}
              </div>
              <div className="text-sm text-gray-600">Món đang chờ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {tables.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => handleTableClick(table.id)}
                className={`
                  p-6 rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-105
                  ${
                    table.status === 'occupied'
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                      : 'bg-gradient-to-br from-green-400 to-green-500 text-white'
                  }
                `}
              >
                {/* Table Number */}
                <div className="text-center mb-3">
                  <div className="text-4xl font-bold">#{table.number}</div>
                  <div className="text-sm opacity-90">{table.seats} chỗ</div>
                </div>

                {/* Status Badge */}
                <div
                  className={`
                  text-xs font-semibold px-3 py-1 rounded-full mb-2
                  ${
                    table.status === 'occupied'
                      ? 'bg-white bg-opacity-30'
                      : 'bg-white bg-opacity-30'
                  }
                `}
                >
                  {table.status === 'occupied' ? 'Đang phục vụ' : 'Trống'}
                </div>

                {/* Order Info (if occupied) */}
                {table.status === 'occupied' && (
                  <div className="mt-3 pt-3 border-t border-white border-opacity-30">
                    {table.pendingItemsCount !== undefined &&
                      table.pendingItemsCount > 0 && (
                        <div className="text-sm mb-1">
                          <span className="font-bold">
                            {table.pendingItemsCount}
                          </span>{' '}
                          món chờ lên
                        </div>
                      )}
                    {table.totalAmount !== undefined && (
                      <div className="text-sm font-bold">
                        {formatPrice(table.totalAmount)}
                      </div>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              Chưa có bàn nào trong hệ thống
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
