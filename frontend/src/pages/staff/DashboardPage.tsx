import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useTables, useOrders } from '../../hooks/useApi';
import { TableCard } from '../../components/staff/TableCard';
import type { TableDashboardItem, OrderRead } from '../../types';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { data: tables, isLoading: tablesLoading, refetch: refetchTables } = useTables();
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useOrders();
  const [tableDashboard, setTableDashboard] = useState<TableDashboardItem[]>([]);

  useEffect(() => {
    if (tables && orders) {
      const dashboardData: TableDashboardItem[] = tables.map((table) => {
        // Find active orders for this table (status_id = 1 means pending/active)
        const tableOrders = orders.filter(
          (order: OrderRead) => order.table_id === table.id && order.status_id === 1
        );

        const hasActiveOrder = tableOrders.length > 0;
        const currentOrder = tableOrders[0]; // Assuming one active order per table

        let totalAmount = 0;
        let itemCount = 0;

        if (currentOrder && currentOrder.items) {
          itemCount = currentOrder.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          totalAmount = currentOrder.items.reduce(
            (sum, item) => sum + parseFloat(item.dish.price) * item.quantity,
            0
          );
        }

        return {
          ...table,
          status: hasActiveOrder ? 'occupied' : 'available',
          currentOrder,
          totalAmount: hasActiveOrder ? totalAmount : undefined,
          itemCount: hasActiveOrder ? itemCount : undefined,
        };
      });

      setTableDashboard(dashboardData);
    }
  }, [tables, orders]);

  const handleRefresh = () => {
    refetchTables();
    refetchOrders();
  };

  const handleTableClick = (tableId: number) => {
    navigate(`/staff/table/${tableId}`);
  };

  const isLoading = tablesLoading || ordersLoading;

  const occupiedCount = tableDashboard.filter((t) => t.status === 'occupied').length;
  const availableCount = tableDashboard.filter((t) => t.status === 'available').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Staff Dashboard</h1>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={24} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {tableDashboard.length}
              </div>
              <div className="text-sm text-gray-600">Tổng bàn</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{occupiedCount}</div>
              <div className="text-sm text-gray-600">Đang phục vụ</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {availableCount}
              </div>
              <div className="text-sm text-gray-600">Trống</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">0</div>
              <div className="text-sm text-gray-600">Đã đặt</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg p-4 animate-pulse h-32"
              ></div>
            ))}
          </div>
        ) : tableDashboard.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tableDashboard.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onClick={handleTableClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Chưa có bàn nào</p>
          </div>
        )}
      </div>
    </div>
  );
};
