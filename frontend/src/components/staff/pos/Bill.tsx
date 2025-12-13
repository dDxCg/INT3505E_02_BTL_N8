import { useState } from "react";
import { usePOSStore } from "../../../stores/posStore";
import { useCreateOrder, useCreateOrderItem } from "../../../hooks/useApi";
import { useNavigate } from "react-router-dom";

const Bill: React.FC = () => {
  const cart = usePOSStore((state) => state.cart);
  const getTotalPrice = usePOSStore((state) => state.getTotalPrice);
  const clearCart = usePOSStore((state) => state.clearCart);
  const customer = usePOSStore((state) => state.customer);

  const [paymentMethod, setPaymentMethod] = useState<string>();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const createOrder = useCreateOrder();
  const createOrderItem = useCreateOrderItem();
  const navigate = useNavigate();

  const total = getTotalPrice();
  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method!");
      return;
    }

    if (cart.length === 0) {
      alert("Please add items to cart!");
      return;
    }

    if (!customer.table?.tableId) {
      alert("Please select a table!");
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Step 1: Create Order
      console.log("Creating order for table:", customer.table.tableId);
      const orderResponse = await createOrder.mutateAsync({
        table_id: customer.table.tableId,
        status_id: 1, // PENDING
      });

      const orderId = orderResponse.data.id;
      console.log("Order created with ID:", orderId);

      // Step 2: Create Order Items for each cart item
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
      console.log("All order items created successfully");

      // Step 3: Clear cart and show success
      clearCart();
      alert(`Order #${orderId} placed successfully!\n\nTable: ${customer.table.tableNo}\nTotal: ${totalPriceWithTax.toLocaleString('vi-VN')}₫\nPayment: ${paymentMethod}`);

      // Navigate to orders page or table detail
      navigate(`/staff/orders`);
    } catch (error: any) {
      console.error("Error placing order:", error);
      alert(`Failed to place order: ${error.message || "Unknown error"}\n\nPlease check the console for details.`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">
          Items({cart.length})
        </p>
        <h1 className="text-[#f5f5f5] text-md font-bold">
          {total.toLocaleString('vi-VN')}₫
        </h1>
      </div>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">Tax(5.25%)</p>
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
      <div className="flex items-center gap-3 px-5 mt-4">
        <button
          onClick={() => setPaymentMethod("Cash")}
          className={`bg-[#1f1f1f] px-4 py-3 w-full rounded-lg text-[#ababab] font-semibold ${
            paymentMethod === "Cash" ? "bg-[#383737]" : ""
          }`}
        >
          Cash
        </button>
        <button
          onClick={() => setPaymentMethod("Online")}
          className={`bg-[#1f1f1f] px-4 py-3 w-full rounded-lg text-[#ababab] font-semibold ${
            paymentMethod === "Online" ? "bg-[#383737]" : ""
          }`}
        >
          Online
        </button>
      </div>

      <div className="flex items-center gap-3 px-5 mt-4">
        <button className="bg-[#025cca] px-4 py-3 w-full rounded-lg text-[#f5f5f5] font-semibold text-lg">
          Print Receipt
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder || cart.length === 0}
          className={`px-4 py-3 w-full rounded-lg font-semibold text-lg ${
            isPlacingOrder || cart.length === 0
              ? "bg-gray-500 text-gray-300 cursor-not-allowed"
              : "bg-[#f6b100] text-[#1f1f1f]"
          }`}
        >
          {isPlacingOrder ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </>
  );
};

export default Bill;
