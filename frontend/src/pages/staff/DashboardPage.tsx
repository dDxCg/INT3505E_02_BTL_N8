import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Bell, User, Search, Grid3x3, List, LayoutGrid } from 'lucide-react';
import { useTables, useOrders } from '../../hooks/useApi';
import { TableCard } from '../../components/staff/TableCard';
import type { TableDashboardItem, OrderRead } from '../../types';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { data: tables, isLoading: tablesLoading, refetch: refetchTables } = useTables();
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useOrders();
  const [tableDashboard, setTableDashboard] = useState<TableDashboardItem[]>([]);
  const [activeStatusTab, setActiveStatusTab] = useState<'dine-in' | 'takeaway' | 'reservations'>('dine-in');
  const [activeViewTab, setActiveViewTab] = useState<'table' | 'board' | 'list'>('table');
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="min-h-screen bg-gray-100">
      {/* Piznek-Style Top Bar */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        {/* Left: Logo/Brand (optional) */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={20} className={`text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Center: Status Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveStatusTab('dine-in')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeStatusTab === 'dine-in'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Dine In ({occupiedCount})
          </button>
          <button
            onClick={() => setActiveStatusTab('takeaway')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeStatusTab === 'takeaway'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Takeaway
          </button>
          <button
            onClick={() => setActiveStatusTab('reservations')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeStatusTab === 'reservations'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Reservations
          </button>
        </div>

        {/* Right: User Profile & Notification */}
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
              placeholder="Search tables..."
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
            <span className="text-gray-600">Occupied: <span className="font-semibold text-gray-900">{occupiedCount}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Available: <span className="font-semibold text-gray-900">{availableCount}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <span className="text-gray-600">Total: <span className="font-semibold text-gray-900">{tableDashboard.length}</span></span>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="container mx-auto px-6 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 animate-pulse h-32 shadow-sm"
              ></div>
            ))}
          </div>
        ) : tableDashboard.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tableDashboard
              .filter((table) =>
                searchQuery === '' ||
                table.number.toString().includes(searchQuery) ||
                table.capacity.toString().includes(searchQuery)
              )
              .map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  onClick={handleTableClick}
                />
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No tables found</p>
          </div>
        )}
      </div>
    </div>
  );
};
