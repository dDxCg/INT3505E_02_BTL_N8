import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, QrCode, FileText, Table2, Activity, Bell } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Toaster } from '../../components/ui/toaster';
import { toast } from '../../components/ui/use-toast';

// ===== API imports =====
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
} from '../../services/api';

// ===== type imports =====
import type { TableRead, OrderRead, OrderItemRead, DishRead } from '../../types/schema';

// ===== Component imports =====
import { POSSidebar } from '../../components/pos/POSSidebar';
import { CategoryTabs } from '../../components/pos/CategoryTabs';
import { DishGrid } from '../../components/pos/DishGrid';
import { OrderSidebar } from '../../components/pos/OrderSidebar';

export default function POSPage() {
  const navigate = useNavigate();

  // ===== state =====
  const [tables, setTables] = useState<TableRead[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [table, setTable] = useState<TableRead | null>(null);
  const [activeOrder, setActiveOrder] = useState<OrderRead | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [dishes, setDishes] = useState<DishRead[]>([]);
  const [dishesLoading, setDishesLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('Show All');
  const [searchQuery, setSearchQuery] = useState('');

  // ===== NEW: Live sync indicator =====
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  // ===== NEW: Change detection for new orders =====
  const previousTablesRef = useRef<TableRead[]>([]);
  const previousOrderItemsRef = useRef<OrderItemRead[]>([]);
  const [newOrderTables, setNewOrderTables] = useState<Set<number>>(new Set());

  const categories = ['Show All'];

  // ===== Fetch table data =====
  const fetchTableData = async (tableId: number) => {
    try {
      setLoading(true);
      setIsSyncing(true);

      const [tableData, orders] = await Promise.all([
        getTableById(tableId),
        getOrderByTable(tableId, 1), // status_id=1 (pending/active)
      ]);

      setTable(tableData);

      if (orders.length > 0) {
        const order = orders[0];
        setActiveOrder(order);

        const items = await getOrderItems(order.id);

        // Detect new items added to this order
        if (previousOrderItemsRef.current.length > 0 && items.length > previousOrderItemsRef.current.length) {
          const newItemsCount = items.length - previousOrderItemsRef.current.length;

          toast({
            variant: 'success',
            title: '🍽️ New Items Added!',
            description: `${newItemsCount} new item(s) added to Table ${tableData.number}`,
          });
        }

        previousOrderItemsRef.current = items;
        setOrderItems(items);
      } else {
        setActiveOrder(null);
        setOrderItems([]);
        previousOrderItemsRef.current = [];
      }

      // Update sync time
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Failed to fetch table data:', error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  // ===== Fetch dishes =====
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

  // ===== Fetch all tables =====
  const fetchTables = async () => {
    try {
      setIsSyncing(true);
      const tablesData = await getTables();

      // Detect new orders by comparing with previous state
      if (previousTablesRef.current.length > 0) {
        const previousTables = previousTablesRef.current;

        // Check each table for new or updated orders
        for (const newTable of tablesData) {
          const previousTable = previousTables.find(t => t.id === newTable.id);

          // If table didn't have an order before but has one now
          if (previousTable && !previousTable.current_order_id && newTable.current_order_id) {
            // New order detected
            console.log('[POS] NEW ORDER DETECTED for table:', newTable.number);
            setNewOrderTables(prev => new Set(prev).add(newTable.id));

            // Show toast notification
            console.log('[POS] Showing toast notification...');
            toast({
              variant: 'success',
              title: '🔔 New Order Received!',
              description: `Table ${newTable.number} has placed a new order`,
            });
            console.log('[POS] Toast called successfully');

            // Play sound alert using Web Audio API
            try {
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();

              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);

              oscillator.frequency.value = 800;
              oscillator.type = 'sine';
              gainNode.gain.value = 0.1;

              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.2);
            } catch (error) {
              console.log('[POS] Audio not supported:', error);
            }

            // Remove highlight after 10 seconds
            setTimeout(() => {
              setNewOrderTables(prev => {
                const updated = new Set(prev);
                updated.delete(newTable.id);
                return updated;
              });
            }, 10000);
          }
        }
      }

      // Update previous tables reference
      previousTablesRef.current = tablesData;
      setTables(tablesData);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // ===== Auto-refresh when table selected =====
  useEffect(() => {
    if (!selectedTableId) return;

    fetchTableData(selectedTableId);

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchTableData(selectedTableId);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedTableId]);

  // ===== NEW: Auto-refresh tables list (for new orders from guests) =====
  useEffect(() => {
    fetchDishes();
    fetchTables();

    // Poll tables list every 10 seconds to catch new guest orders
    const tablesInterval = setInterval(() => {
      fetchTables();
    }, 10000);

    return () => clearInterval(tablesInterval);
  }, []);

  // ===== Add dish to order =====
  const handleAddDish = async (dish: DishRead) => {
    if (!selectedTableId) {
      alert('Please select a table first');
      return;
    }

    try {
      setActionLoading(dish.id);

      if (!activeOrder) {
        const newOrder = await createOrder({
          table_id: selectedTableId,
          status_id: 1, // Pending
        });
        setActiveOrder(newOrder);

        await addOrderItem({
          order_id: newOrder.id,
          dish_id: dish.id,
          quantity: 1,
          status_id: 1,
        });
      } else {
        await addOrderItem({
          order_id: activeOrder.id,
          dish_id: dish.id,
          quantity: 1,
          status_id: 1,
        });
      }

      await fetchTableData(selectedTableId);
    } catch (error) {
      console.error('Failed to add dish:', error);
      alert('Failed to add dish. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // ===== Update item quantity =====
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

  // ===== Remove item =====
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

  // ===== KOT Print =====
  const handleKOTPrint = () => {
    console.log('KOT Print clicked');
    alert('KOT printed successfully!');
  };

  // ===== Draft handler =====
  const handleDraft = () => {
    console.log('Draft clicked');
    alert('Order saved as draft!');
  };

  // ===== Payment handler =====
  const handleBillPayment = async () => {
    if (!activeOrder || !selectedTableId) return;

    const pendingItems = orderItems.filter((item) => item.status_id === 1);
    if (pendingItems.length > 0) {
      alert('Please serve all items before completing payment');
      return;
    }

    if (!confirm('Confirm payment and go to payment screen?')) return;

    try {
      setPaymentLoading(true);

      const currentTable =
        tables.find((t) => t.id === selectedTableId) || table;

      // chỉ điều hướng, không đóng order ở đây
      navigate(`/staff/payment/order/${activeOrder.id}`, {
        state: {
          tableLabel: currentTable
            ? currentTable.number.toString()
            : String(selectedTableId),
        },
      });
    } catch (error) {
      console.error('Failed to go to payment screen:', error);
      alert('Failed to go to payment screen. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleBillPrint = async () => {
    await handleBillPayment();
    console.log('Bill printed (demo)');
  };

  // ===== Filter dishes =====
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
      {/* LEFT SIDEBAR */}
      <POSSidebar currentPage="pos" />

      {/* CENTER */}
      <main className="flex-1 overflow-y-auto h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900"> Restaurant POS</h1>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                  <Activity
                    size={14}
                    className={`text-green-600 ${isSyncing ? 'animate-pulse' : ''}`}
                  />
                  <span className="text-xs font-medium text-green-700">Live Sync: ON</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">Dashboard • Pos</p>
            </div>

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
          <div className="mb-6">
            <CategoryTabs
              categories={categories}
              activeCategory={categoryFilter}
              onCategoryChange={setCategoryFilter}
            />
          </div>

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
        newOrderTables={newOrderTables}
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
