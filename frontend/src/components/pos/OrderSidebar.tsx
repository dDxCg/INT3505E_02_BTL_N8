import { ShoppingCart, User } from 'lucide-react';
import { OrderItem } from './OrderItem';
import { Select } from '../ui/select';
import { CartEmptyState } from './CartEmptyState';
import { formatCurrency } from '../../lib/utils';
import type { OrderRead, OrderItemRead, TableRead } from '../../types/schema';

interface OrderSidebarProps {
  tables: TableRead[];
  selectedTableId: number | null;
  onTableChange: (tableId: number) => void;
  order: OrderRead | null;
  orderItems: OrderItemRead[];
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onKOTPrint: () => void;
  onDraft: () => void;
  onBillPayment: () => void;
  onBillPrint: () => void;
  loading?: boolean;
  newOrderTables?: Set<number>;
}

export function OrderSidebar({
  tables,
  selectedTableId,
  onTableChange,
  order,
  orderItems,
  onUpdateQuantity,
  onRemoveItem,
  onKOTPrint,
  onDraft,
  onBillPayment,
  onBillPrint,
  loading,
  newOrderTables = new Set()
}: OrderSidebarProps) {
  // Calculate totals
  const subtotal = orderItems.reduce(
    (sum, item) => sum + Number(item.dish.price) * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const discount = 0; // Can be calculated based on business logic
  const total = subtotal + tax - discount;

  const hasPendingItems = orderItems.some(item => item.status_id === 1);

  return (
    <div className="w-[380px] bg-white border-l border-gray-200 flex flex-col h-screen overflow-hidden">
      {/* Top Section - Table & Dining Selection */}
      <div className="p-5 border-b border-gray-200 bg-white">
        {/* Order Number Header */}
        {order && (
          <div className="flex items-center gap-2 mb-4">
            <User className="w-7 h-7 p-1.5 bg-gray-100 rounded-full text-gray-700" />
            <h2 className="font-bold text-gray-900 text-lg">Order #{order.id}</h2>
          </div>
        )}

        {/* Selectors */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              Select Dining
            </label>
            <Select className="h-11">
              <option>Dine In</option>
              <option>Take Away</option>
              <option>Delivery</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              Select Table
            </label>
            <Select
              className={`h-11 ${newOrderTables.size > 0 ? 'animate-pulse-border' : ''}`}
              value={selectedTableId || ''}
              onChange={(e) => onTableChange(Number(e.target.value))}
            >
              <option value="">Select Table</option>
              {tables.map((table) => {
                const hasNewOrder = newOrderTables.has(table.id);
                return (
                  <option
                    key={table.id}
                    value={table.id}
                    style={hasNewOrder ? { fontWeight: 'bold', color: '#16a34a' } : {}}
                  >
                    {hasNewOrder ? '🔔 ' : ''}Table #{table.number} ({table.seats} seats){hasNewOrder ? ' - NEW ORDER!' : ''}
                  </option>
                );
              })}
            </Select>
          </div>
        </div>
      </div>

      {/* Middle Section - Cart Items (Scrollable) */}
      <div className="flex-1 overflow-y-auto bg-gray-50/30">
        {!selectedTableId ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center px-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={36} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500 font-medium">Select a table to start ordering</p>
            </div>
          </div>
        ) : orderItems.length === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="p-4 space-y-2.5">
            {orderItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-3.5 shadow-sm border border-gray-100 hover:border-orange-200 transition-colors">
                <OrderItem
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemoveItem}
                  disabled={loading}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section - Summary & Actions (Sticky) */}
      {orderItems.length > 0 && (
        <div className="bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          {/* Summary */}
          <div className="p-5 space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Sub total :</span>
              <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Product Discount :</span>
              <span className="font-semibold text-gray-900">{formatCurrency(discount)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Extra Discount :</span>
              <span className="font-semibold text-gray-900">{formatCurrency(0)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Coupon discount :</span>
              <span className="font-semibold text-gray-900">{formatCurrency(0)}</span>
            </div>

            {/* Total - Large & Bold */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-gray-900 font-bold text-base">Total :</span>
              <span className="text-gray-900 font-bold text-2xl">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-5 pb-5 space-y-3">
            {/* Row 1: KOT & Print + Draft */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onKOTPrint}
                disabled={loading}
                className="h-11 bg-gray-800 text-white rounded-lg font-semibold text-sm hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                KOT & Print
              </button>
              <button
                onClick={onDraft}
                disabled={loading}
                className="h-11 bg-white text-gray-700 rounded-lg font-semibold text-sm border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Draft
              </button>
            </div>

            {/* Row 2: Bill & Payment + Bill & Print */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onBillPayment}
                disabled={loading || hasPendingItems}
                className="h-12 bg-orange-500 text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Bill & Payment
              </button>
              <button
                onClick={onBillPrint}
                disabled={loading || hasPendingItems}
                className="h-12 bg-green-500 text-white rounded-lg font-bold text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Bill & Print
              </button>
            </div>

            {hasPendingItems && (
              <p className="text-xs text-amber-600 text-center pt-1">
                ⚠ Please serve all items before completing payment
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
