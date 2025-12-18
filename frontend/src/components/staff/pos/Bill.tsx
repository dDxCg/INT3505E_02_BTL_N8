import { useState, useMemo } from "react";
import { usePOSStore } from "../../../stores/posStore";
import { useCreateOrder, useCreateOrderItem, useCompleteOrder } from "../../../hooks/useApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { OrderRead, OrderItemRead } from "../../../types";

interface BillProps {
  activeOrder?: OrderRead;
  existingOrderItems?: OrderItemRead[];
}

const Bill: React.FC<BillProps> = ({ activeOrder, existingOrderItems }) => {
  const cart = usePOSStore((state) => state.cart);
  const getTotalPrice = usePOSStore((state) => state.getTotalPrice);
  const clearCart = usePOSStore((state) => state.clearCart);
  const customer = usePOSStore((state) => state.customer);

  const [isProcessing, setIsProcessing] = useState(false);

  const createOrder = useCreateOrder();
  const createOrderItem = useCreateOrderItem();
  const completeOrder = useCompleteOrder();
  const navigate = useNavigate();

  // Group existing items by dish_id for display
  const groupedOrderItems = useMemo(() => {
    if (!existingOrderItems || existingOrderItems.length === 0) return [];

    const grouped = new Map<number, {
      dish_id: number;
      dish_name: string;
      dish_price: number;
      total_quantity: number;
      status_id: number;
    }>();

    existingOrderItems.forEach(item => {
      const dishId = item.dish.id;
      const existing = grouped.get(dishId);

      if (existing) {
        existing.total_quantity += item.quantity;
        if (item.status_id > existing.status_id) {
          existing.status_id = item.status_id;
        }
      } else {
        grouped.set(dishId, {
          dish_id: dishId,
          dish_name: item.dish.name,
          dish_price: parseFloat(item.dish.price.toString()),
          total_quantity: item.quantity,
          status_id: item.status_id,
        });
      }
    });

    return Array.from(grouped.values());
  }, [existingOrderItems]);

  // Calculate totals including grouped existing order items
  const cartTotal = getTotalPrice();
  const existingTotal = groupedOrderItems.reduce(
    (sum, group) => sum + group.dish_price * group.total_quantity,
    0
  );
  const total = cartTotal + existingTotal;
  const taxRate = 10;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;
  const totalItems = groupedOrderItems.length + cart.length;

  // Check if all existing order items are preparing (status_id === 2)
  const allItemsReady = existingOrderItems?.every(item => item.status_id === 2) ?? true;

  // Payment is only allowed when:
  // 1. All existing order items are ready (status_id === 2)
  // 2. AND there are NO new cart items (cart must be empty)
  // This prevents payment when new items have just been added but not yet prepared
  const canProcessPayment = allItemsReady && cart.length === 0 && activeOrder;

  const handleAddToOrder = async () => {
    if (!customer.table?.tableId) {
      toast.warning("Please select a table!");
      return;
    }

    if (cart.length === 0) {
      toast.warning("No items to add!");
      return;
    }

    setIsProcessing(true);

    try {
      let orderId: number;

      // Step 1: Get or create order
      if (!activeOrder) {
        console.log("Creating new order for table:", customer.table.tableId);
        const orderResponse = await createOrder.mutateAsync({
          table_id: customer.table.tableId,
          status_id: 1, // CREATED/PENDING
        });
        orderId = orderResponse.data.id;
        console.log("Order created with ID:", orderId);
      } else {
        orderId = activeOrder.id;
      }

      // Step 2: Add cart items to the order
      const orderItemPromises = cart.map(item => {
        if (!item.dish_id) {
          console.error("Cart item missing dish_id:", item);
          throw new Error(`Cart item "${item.name}" is missing dish_id`);
        }

        return createOrderItem.mutateAsync({
          order_id: orderId,
          dish_id: item.dish_id,
          quantity: item.quantity,
          status_id: 1, // PENDING
        });
      });

      await Promise.all(orderItemPromises);
      console.log("All cart items added to order");

      // Step 3: Clear cart and show success
      clearCart();
      toast.success(`Items added to Order #${orderId} successfully!`);
    } catch (error: any) {
      console.error("Error adding items to order:", error);
      toast.error(`Failed to add items: ${error.message || "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    if (totalItems === 0) {
      toast.warning("No items to print!");
      return;
    }

    // Generate receipt HTML
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      toast.error("Please allow popups to print receipt");
      return;
    }

    // Combine grouped existing items and cart items
    const allItems = [
      ...groupedOrderItems.map(group => ({
        name: group.dish_name,
        quantity: group.total_quantity,
        price: group.dish_price * group.total_quantity
      })),
      ...cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    ];

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              margin: 20px;
              font-size: 14px;
            }
            .receipt {
              max-width: 300px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
            }
            .header h1 {
              margin: 5px 0;
              font-size: 24px;
            }
            .header p {
              margin: 3px 0;
              font-size: 12px;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
            }
            .item-name {
              flex: 1;
            }
            .item-qty {
              margin: 0 10px;
            }
            .item-price {
              text-align: right;
              min-width: 80px;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 15px 0;
            }
            .total-section {
              margin-top: 15px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .total-row.grand {
              font-weight: bold;
              font-size: 16px;
              border-top: 2px solid #000;
              padding-top: 10px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              border-top: 2px dashed #000;
              padding-top: 10px;
              font-size: 12px;
            }
            @media print {
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>RESTAURANT POS</h1>
              <p>Receipt</p>
              <p>Date: ${new Date().toLocaleString('vi-VN')}</p>
              <p>Table: ${customer.table?.tableNo || 'N/A'}</p>
            </div>

            <div class="items">
              ${allItems.map(item => `
                <div class="item">
                  <span class="item-name">${item.name}</span>
                  <span class="item-qty">x${item.quantity}</span>
                  <span class="item-price">${item.price.toLocaleString('vi-VN')}₫</span>
                </div>
              `).join('')}
            </div>

            <div class="divider"></div>

            <div class="total-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${total.toLocaleString('vi-VN')}₫</span>
              </div>
              <div class="total-row">
                <span>Tax (10%):</span>
                <span>${tax.toLocaleString('vi-VN')}₫</span>
              </div>
              <div class="total-row grand">
                <span>TOTAL:</span>
                <span>${totalPriceWithTax.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            <div class="footer">
              <p>Thank you for dining with us!</p>
              <p>Please come again</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 100);
            };
          </script>
        </body>
      </html>
    `;

    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
  };

  const handlePayment = async () => {
    if (!customer.table?.tableId) {
      toast.warning("Please select a table!");
      return;
    }

    if (!activeOrder && cart.length === 0) {
      toast.warning("No items to process payment!");
      return;
    }

    if (cart.length > 0) {
      toast.warning("Cannot process payment! Please add new items to order first, then wait for them to be prepared.");
      return;
    }

    if (!allItemsReady) {
      toast.warning("Cannot process payment! All dishes must be ready (Preparing status) before payment.");
      return;
    }

    setIsProcessing(true);

    try {
      let orderId: number;

      // Step 1: If there are cart items and no active order, create new order
      if (!activeOrder && cart.length > 0) {
        console.log("Creating new order for table:", customer.table.tableId);
        const orderResponse = await createOrder.mutateAsync({
          table_id: customer.table.tableId,
          status_id: 1, // PENDING
        });
        orderId = orderResponse.data.id;
        console.log("Order created with ID:", orderId);
      } else if (activeOrder) {
        orderId = activeOrder.id;
      } else {
        throw new Error("No order to process");
      }

      // Step 2: Add any new cart items to the order
      if (cart.length > 0) {
        const orderItemPromises = cart.map(item => {
          if (!item.dish_id) {
            console.error("Cart item missing dish_id:", item);
            throw new Error(`Cart item "${item.name}" is missing dish_id`);
          }

          return createOrderItem.mutateAsync({
            order_id: orderId,
            dish_id: item.dish_id,
            quantity: item.quantity,
            status_id: 1, // PENDING
          });
        });

        await Promise.all(orderItemPromises);
        console.log("All cart items added to order");
      }

      // Step 3: Complete order (sets status to COMPLETED and frees table)
      await completeOrder.mutateAsync(orderId);
      console.log("Order completed and table freed");

      // Step 4: Clear cart and show success
      clearCart();
      toast.success(`Payment completed successfully! Order #${orderId} | Total: ${totalPriceWithTax.toLocaleString('vi-VN')}₫`, {
        autoClose: 5000
      });

      // Navigate to tables page
      navigate(`/staff/tables`);
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error(`Failed to process payment: ${error.message || "Unknown error"}. Please check the console for details.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">
          Items({totalItems})
        </p>
        <h1 className="text-[#f5f5f5] text-md font-bold">
          {total.toLocaleString('vi-VN')}₫
        </h1>
      </div>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">Tax(10%)</p>
        <h1 className="text-[#f5f5f5] text-md font-bold">{tax.toLocaleString('vi-VN')}₫</h1>
      </div>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">
          Total With Tax
        </p>
        <h1 className="text-[#f5f5f5] text-md font-bold">
          {totalPriceWithTax.toLocaleString('vi-VN')}₫
        </h1>
      </div>

      <div className="flex flex-col gap-2 px-5 mt-4">
        {/* Add to Order button (only show when cart has items) */}
        {cart.length > 0 && (
          <button
            onClick={handleAddToOrder}
            disabled={isProcessing}
            className={`px-4 py-3 w-full rounded-lg font-semibold text-lg ${
              isProcessing
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-[#02ca3a] text-[#1f1f1f] hover:bg-[#02b332]"
            }`}
          >
            {isProcessing ? "Adding..." : "Add to Order"}
          </button>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintReceipt}
            disabled={totalItems === 0}
            className={`px-4 py-3 w-full rounded-lg font-semibold text-lg ${
              totalItems === 0
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-[#025cca] text-[#f5f5f5] hover:bg-[#0250a8]"
            }`}
          >
            Print Receipt
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing || !canProcessPayment}
            className={`px-4 py-3 w-full rounded-lg font-semibold text-lg ${
              isProcessing || !canProcessPayment
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-[#f6b100] text-[#1f1f1f]"
            }`}
            title={
              cart.length > 0
                ? "Add new items to order first"
                : !allItemsReady
                ? "All dishes must be ready before payment"
                : ""
            }
          >
            {isProcessing ? "Processing..." : "Payment"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Bill;
