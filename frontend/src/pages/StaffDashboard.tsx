import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Loader2, Bell, User, Search, Grid3x3, List, LayoutGrid } from 'lucide-react';
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
  const [activeStatusTab, setActiveStatusTab] = useState<'dine-in' | 'takeaway' | 'reservations'>('dine-in');
  const [activeViewTab, setActiveViewTab] = useState<'table' | 'board' | 'list'>('table');
  const [searchQuery, setSearchQuery] = useState('');

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  // Filter tables based on search
  const filteredTables = tables.filter((table) =>
    searchQuery === '' ||
    table.number.toString().includes(searchQuery) ||
    table.seats.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Piznek-Style Top Bar */}
      <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
        {/* Left: Refresh Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={20} className={`text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Center: Status Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveStatusTab('dine-in')}
            className={`rounded-full px-4 py-1 text-sm font-medium transition-all ${
              activeStatusTab === 'dine-in'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Dine In ({occupiedCount})
          </button>
          <button
            onClick={() => setActiveStatusTab('takeaway')}
            className={`rounded-full px-4 py-1 text-sm font-medium transition-all ${
              activeStatusTab === 'takeaway'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Takeaway
          </button>
          <button
            onClick={() => setActiveStatusTab('reservations')}
            className={`rounded-full px-4 py-1 text-sm font-medium transition-all ${
              activeStatusTab === 'reservations'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Reservations
          </button>
        </div>

        {/* Right: User Profile & Notification */}
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell size={20} className="text-gray-600" />
            {totalPendingItems > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <User size={20} className="text-gray-600" />
          </button>
        </div>
      </header>

      {/* Sub-Header: Filters & Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: View Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveViewTab('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeViewTab === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3x3 size={16} />
              Table
            </button>
            <button
              onClick={() => setActiveViewTab('board')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeViewTab === 'board'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid size={16} />
              Board
            </button>
            <button
              onClick={() => setActiveViewTab('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeViewTab === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={16} />
              List
            </button>
          </div>

          {/* Right: Search Input */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm bàn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-gray-600">Đang phục vụ: <span className="font-semibold text-gray-900">{occupiedCount}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Trống: <span className="font-semibold text-gray-900">{availableCount}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-gray-600">Món chờ: <span className="font-semibold text-gray-900">{totalPendingItems}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <span className="text-gray-600">Tổng: <span className="font-semibold text-gray-900">{tables.length}</span></span>
          </div>
        </div>
      </div>

      {/* Tables Grid - Piznek Pill Badge Style */}
      <main className="p-6">
        {filteredTables.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredTables.map((table) => {
              // Calculate time elapsed if occupied (mock for now - you can add real timestamps)
              const getTimeElapsed = () => {
                // This would come from order.created_at in real implementation
                return '45 min';
              };

              return (
                <button
                  key={table.id}
                  onClick={() => handleTableClick(table.id)}
                  className={`
                    bg-white rounded-3xl h-32 flex flex-col items-center justify-center relative
                    shadow-sm border-[3px] transition-all cursor-pointer hover:shadow-lg
                    ${table.status === 'occupied' ? 'border-white' : 'border-gray-100'}
                  `}
                >
                  {/* Empty Table */}
                  {table.status === 'available' && (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-400 mb-1">
                        T-{table.number}
                      </div>
                      <div className="text-xs text-gray-400">{table.seats} chỗ</div>
                    </div>
                  )}

                  {/* Occupied Table */}
                  {table.status === 'occupied' && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          Bàn {table.number}
                        </div>
                        <div className="text-sm text-gray-500">{getTimeElapsed()}</div>
                        {table.totalAmount !== undefined && (
                          <div className="text-xs font-semibold text-gray-700 mt-1">
                            {formatPrice(table.totalAmount)}
                          </div>
                        )}
                      </div>

                      {/* Red Pill Badge at Bottom */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                        <div className="bg-red-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                          {table.pendingItemsCount !== undefined && table.pendingItemsCount > 0 ? (
                            <span>{table.pendingItemsCount} món chờ</span>
                          ) : (
                            <span>Đang dùng</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'Không tìm thấy bàn nào' : 'Chưa có bàn nào trong hệ thống'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
