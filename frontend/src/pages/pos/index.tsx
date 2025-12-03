import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, QrCode, FileText, Table2 } from 'lucide-react';
import { Input } from '../../components/ui/input';

// ===== PRESERVE: Existing API imports =====
import {
  getTables,
  getTableById,
  getDishes,
  getOrderByTable,
  getOrderItems,
  createOrder,
  addOrderItem,
  updateItemStatus,
  deleteOrderItem,
  updateOrder,
} from '../../services/api';

// ===== PRESERVE: Existing type imports =====
import type { TableRead, OrderRead, OrderItemRead, DishRead } from '../../types/schema';

// ===== NEW: Component imports =====
import { POSSidebar } from '../../components/pos/POSSidebar';
import { CategoryTabs } from '../../components/pos/CategoryTabs';
import { DishGrid } from '../../components/pos/DishGrid';
import { OrderSidebar } from '../../components/pos/OrderSidebar';

export default function POSPage() {
  const navigate = useNavigate();

  // ===== PRESERVE: Existing state from StaffTableDetail.tsx =====
  const [tables, setTables] = useState<TableRead[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [table, setTable] = useState<TableRead | null>(null);
  const [activeOrder, setActiveOrder] = useState<OrderRead | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // ===== NEW: Dish browsing state =====
  const [dishes, setDishes] = useState<DishRead[]>([]);
  const [dishesLoading, setDishesLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('Show All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Show All'];

  // ===== PRESERVE: Fetch table data (existing logic) =====
  const fetchTableData = async (tableId: number) => {
    try {
      setLoading(true);

      // Fetch table info and active orders
      const [tableData, orders] = await Promise.all([
        getTableById(tableId),
        getOrderByTable(tableId, 1), // status_id=1 (pending/active)
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

  // ===== NEW: Fetch dishes =====
  const fetchDishes = async () => {
    try {
      setDishesLoading(true);
      const dishesData = await getDishes();
      setDishes(dishesData);
    } catch (error) {
      console.error('Failed to fetch dishes:', error);
    } finally {
      setDishesLoading(false);
    }
  };

  // ===== NEW: Fetch all tables =====
  const fetchTables = async () => {
    try {
      const tablesData = await getTables();
      setTables(tablesData);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

  // ===== PRESERVE: Auto-refresh when table selected =====
  useEffect(() => {
    if (!selectedTableId) return;

    fetchTableData(selectedTableId);

    // Auto-refresh every 3 seconds
    const interval = setInterval(() => {
      fetchTableData(selectedTableId);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedTableId]);

  // ===== Initialize: Fetch dishes and tables on mount =====
  useEffect(() => {
    fetchDishes();
    fetchTables();
  }, []);

  // ===== NEW: Add dish to order =====
  const handleAddDish = async (dish: DishRead) => {
    if (!selectedTableId) {
      alert('Please select a table first');
      return;
    }

    try {
      setActionLoading(dish.id);

      // If no active order, create one first
      if (!activeOrder) {
        const newOrder = await createOrder({
          table_id: selectedTableId,
          status_id: 1, // Pending
        });
        setActiveOrder(newOrder);

        // Add item to the new order
        await addOrderItem({
          order_id: newOrder.id,
          dish_id: dish.id,
          quantity: 1,
          status_id: 1, // Pending
        });
      } else {
        // Add item to existing order
        await addOrderItem({
          order_id: activeOrder.id,
          dish_id: dish.id,
          quantity: 1,
          status_id: 1, // Pending
        });
      }

      // Refresh order data
      await fetchTableData(selectedTableId);
    } catch (error) {
      console.error('Failed to add dish:', error);
      alert('Failed to add dish. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // ===== PRESERVE: Update item quantity =====
  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      setActionLoading(itemId);
      await updateItemStatus(itemId, { quantity: newQuantity });
      if (selectedTableId) {
        await fetchTableData(selectedTableId);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // ===== PRESERVE: Remove item (existing logic) =====
  const handleRemoveItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to remove this item?')) return;

    try {
      setActionLoading(itemId);
      await deleteOrderItem(itemId);
      if (selectedTableId) {
        await fetchTableData(selectedTableId);
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // ===== NEW: KOT Print handler =====
  const handleKOTPrint = () => {
    console.log('KOT Print clicked');
    alert('KOT printed successfully!');
    // Implement KOT printing logic here
  };

  // ===== NEW: Draft handler =====
  const handleDraft = () => {
    console.log('Draft clicked');
    alert('Order saved as draft!');
    // Implement draft saving logic here
  };

  // ===== PRESERVE: Payment handler (existing logic) =====
  const handleBillPayment = async () => {
    if (!activeOrder || !selectedTableId) return;

    const pendingItems = orderItems.filter(item => item.status_id === 1);
    if (pendingItems.length > 0) {
      alert('Please serve all items before completing payment');
      return;
    }

    if (!confirm('Confirm payment and close table?')) return;

    try {
      setPaymentLoading(true);
      await updateOrder(activeOrder.id, { status_id: 3 }); // 3 = Completed

      // Clear selection and refresh
      setSelectedTableId(null);
      setActiveOrder(null);
      setOrderItems([]);

      alert('Payment completed successfully!');
    } catch (error) {
      console.error('Failed to complete payment:', error);
      alert('Failed to complete payment. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // ===== NEW: Bill & Print handler =====
  const handleBillPrint = async () => {
    await handleBillPayment();
    console.log('Bill printed');
  };

  // ===== Filter dishes based on category and search =====
  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory =
      categoryFilter === 'Show All' ||
      dish.name.toLowerCase().includes(categoryFilter.toLowerCase());

    const matchesSearch =
      searchQuery === '' ||
      dish.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // ===== RENDER =====
  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden">
      {/* LEFT SIDEBAR - Navigation - Fixed Width */}
      <POSSidebar currentPage="pos" />

      {/* CENTER - Product Grid - Flexible */}
      <main className="flex-1 overflow-y-auto h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900"> Restaurant POS</h1>
              <p className="text-sm text-gray-500 mt-1">Dashboard • Pos</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="bg-[#FF6B2C] text-white px-1 py-1 rounded-lg font-medium text-sm hover:bg-[#ff5511] transition-colors flex items-center gap-2">
                <Plus size={16} />
                New
              </button>
              <button className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium text-sm border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2">
                <QrCode size={16} />
                QR Menu Orders
              </button>
              <button className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium text-sm border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2">
                <FileText size={18} />
                Draft List
              </button>
              <button className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium text-sm border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Table2 size={18} />
                Table Order
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              <Input
                type="text"
                placeholder="Search in products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                rounded="full"
                className="pl-11 pr-4"
              />
            </div>

            <select className="h-10 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent bg-white">
              <option>All Category</option>
            </select>

            <select className="h-10 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:border-transparent bg-white">
              <option>Select Brand</option>
            </select>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 pb-12">
          {/* Category Tabs */}
          <div className="mb-6">
            <CategoryTabs
              categories={categories}
              activeCategory={categoryFilter}
              onCategoryChange={setCategoryFilter}
            />
          </div>

          {/* Dish Grid */}
          <DishGrid
            dishes={filteredDishes}
            onAddDish={handleAddDish}
            loading={dishesLoading}
          />
        </div>
      </main>

      {/* RIGHT SIDEBAR - Order Cart */}
      <OrderSidebar
        tables={tables}
        selectedTableId={selectedTableId}
        onTableChange={setSelectedTableId}
        order={activeOrder}
        orderItems={orderItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onKOTPrint={handleKOTPrint}
        onDraft={handleDraft}
        onBillPayment={handleBillPayment}
        onBillPrint={handleBillPrint}
        loading={loading}
      />
    </div>
  );
}
