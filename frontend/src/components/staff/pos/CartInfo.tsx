import { useEffect, useRef, useState, useMemo } from "react";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { usePOSStore } from "../../../stores/posStore";
import { useUpdateOrderItem, useDeleteOrderItem } from "../../../hooks/useApi";
import { toast } from "react-toastify";
import type { OrderItemRead } from "../../../types";

interface CartInfoProps {
  existingOrderItems?: OrderItemRead[];
}

const CartInfo: React.FC<CartInfoProps> = ({ existingOrderItems }) => {
  const cart = usePOSStore((state) => state.cart);
  const removeFromCart = usePOSStore((state) => state.removeFromCart);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Track local quantity changes for existing items
  const [localQuantities, setLocalQuantities] = useState<Record<number, number>>({});

  const updateOrderItem = useUpdateOrderItem();
  const deleteOrderItem = useDeleteOrderItem();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [cart, existingOrderItems]);

  // Group existing items by dish_id and aggregate quantities
  const groupedOrderItems = useMemo(() => {
    if (!existingOrderItems || existingOrderItems.length === 0) return [];

    const grouped = new Map<number, {
      dish_id: number;
      dish_name: string;
      dish_price: number;
      total_quantity: number;
      status_id: number; // Use the latest status
      status_name: string;
      item_ids: number[]; // Track all order_item IDs for this dish
    }>();

    existingOrderItems.forEach(item => {
      const dishId = item.dish.id;
      const existing = grouped.get(dishId);

      if (existing) {
        // Aggregate: add quantity and track item ID
        existing.total_quantity += item.quantity;
        existing.item_ids.push(item.id);
        // Use the most advanced status (highest status_id)
        if (item.status_id > existing.status_id) {
          existing.status_id = item.status_id;
          existing.status_name = item.status.status;
        }
      } else {
        // First occurrence of this dish
        grouped.set(dishId, {
          dish_id: dishId,
          dish_name: item.dish.name,
          dish_price: parseFloat(item.dish.price.toString()),
          total_quantity: item.quantity,
          status_id: item.status_id,
          status_name: item.status.status,
          item_ids: [item.id]
        });
      }
    });

    return Array.from(grouped.values());
  }, [existingOrderItems]);

  // Initialize local quantities for grouped items
  useEffect(() => {
    const quantities: Record<number, number> = {};
    groupedOrderItems.forEach(group => {
      quantities[group.dish_id] = group.total_quantity;
    });
    setLocalQuantities(quantities);
  }, [groupedOrderItems]);

  const handleRemove = (itemId: number) => {
    removeFromCart(itemId);
  };

  // Handle updating quantity for grouped dishes
  const handleUpdateGroupQuantity = async (dishId: number, newQuantity: number, itemIds: number[]) => {
    if (newQuantity <= 0) {
      toast.error("Quantity must be at least 1");
      return;
    }

    if (newQuantity > 20) {
      toast.error("Maximum quantity is 20");
      return;
    }

    try {
      // Find the grouped item
      const groupedItem = groupedOrderItems.find(g => g.dish_id === dishId);
      if (!groupedItem) return;

      const oldQuantity = groupedItem.total_quantity;
      const quantityDiff = newQuantity - oldQuantity;

      if (quantityDiff === 0) return;

      if (quantityDiff > 0) {
        // Increment: update the first item's quantity
        const firstItemId = itemIds[0];
        const firstItem = existingOrderItems?.find(i => i.id === firstItemId);
        if (firstItem) {
          await updateOrderItem.mutateAsync({
            id: firstItemId,
            data: { quantity: firstItem.quantity + quantityDiff }
          });
        }
      } else {
        // Decrement: reduce from the last item first
        let remaining = Math.abs(quantityDiff);
        for (let i = itemIds.length - 1; i >= 0 && remaining > 0; i--) {
          const itemId = itemIds[i];
          const item = existingOrderItems?.find(i => i.id === itemId);
          if (!item) continue;

          if (item.quantity > remaining) {
            // Reduce this item's quantity
            await updateOrderItem.mutateAsync({
              id: itemId,
              data: { quantity: item.quantity - remaining }
            });
            remaining = 0;
          } else {
            // Delete this item entirely
            await deleteOrderItem.mutateAsync(itemId);
            remaining -= item.quantity;
          }
        }
      }

      toast.success("Quantity updated successfully");
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  // Handle deleting all order items for a dish
  const handleDeleteGroupedDish = async (itemIds: number[]) => {
    if (!confirm("Are you sure you want to remove all items of this dish?")) {
      return;
    }

    try {
      // Delete all order items for this dish
      await Promise.all(itemIds.map(id => deleteOrderItem.mutateAsync(id)));
      toast.success("Items removed successfully");
    } catch (error) {
      console.error("Failed to delete items:", error);
      toast.error("Failed to delete items");
    }
  };

  // Handle increment for grouped items
  const handleIncrementGrouped = (dishId: number, itemIds: number[]) => {
    const currentQuantity = localQuantities[dishId] || 1;
    const newQuantity = currentQuantity + 1;
    setLocalQuantities(prev => ({ ...prev, [dishId]: newQuantity }));
    handleUpdateGroupQuantity(dishId, newQuantity, itemIds);
  };

  // Handle decrement for grouped items
  const handleDecrementGrouped = (dishId: number, itemIds: number[]) => {
    const currentQuantity = localQuantities[dishId] || 1;
    if (currentQuantity <= 1) return;
    const newQuantity = currentQuantity - 1;
    setLocalQuantities(prev => ({ ...prev, [dishId]: newQuantity }));
    handleUpdateGroupQuantity(dishId, newQuantity, itemIds);
  };

  // Get status color
  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1: return "text-yellow-500"; // Pending
      case 2: return "text-orange-500"; // Cooking
      case 3: return "text-green-500"; // Ready
      case 4: return "text-blue-500"; // Served
      default: return "text-gray-500";
    }
  };

  return (
    <div className="px-4 py-2">
      <h1 className="text-lg text-[#e4e4e4] font-semibold tracking-wide">
        Order Details
      </h1>
      <div className="mt-4 overflow-y-scroll scrollbar-hide h-[380px]" ref={scrollRef}>
        {!existingOrderItems?.length && cart.length === 0 ? (
          <p className="text-[#ababab] text-sm flex justify-center items-center h-[380px]">
            No items yet. Start adding items!
          </p>
        ) : (
          <>
            {/* Existing Order Items (grouped by dish) */}
            {groupedOrderItems.length > 0 && (
              <>
                <h2 className="text-xs text-[#ababab] font-medium mb-2 mt-2">
                  Existing Orders
                </h2>
                {groupedOrderItems.map((group) => {
                  const displayQuantity = localQuantities[group.dish_id] ?? group.total_quantity;
                  const itemPrice = group.dish_price * displayQuantity;

                  return (
                    <div key={`grouped-${group.dish_id}`} className="bg-[#262626] rounded-lg px-4 py-4 mb-2 border-l-4 border-green-600">
                      <div className="flex items-center justify-between">
                        <h1 className="text-[#ababab] font-semibold tracking-wide text-md">
                          {group.dish_name}
                        </h1>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-between bg-[#1f1f1f] px-3 py-2 rounded-lg gap-3">
                            <button
                              onClick={() => handleDecrementGrouped(group.dish_id, group.item_ids)}
                              className="text-yellow-500 text-lg hover:text-yellow-400"
                              disabled={displayQuantity <= 1}
                            >
                              &minus;
                            </button>
                            <span className="text-white text-sm min-w-[20px] text-center">
                              {displayQuantity}
                            </span>
                            <button
                              onClick={() => handleIncrementGrouped(group.dish_id, group.item_ids)}
                              className="text-yellow-500 text-lg hover:text-yellow-400"
                              disabled={displayQuantity >= 20}
                            >
                              &#43;
                            </button>
                          </div>
                          <RiDeleteBin2Fill
                            onClick={() => handleDeleteGroupedDish(group.item_ids)}
                            className="text-[#ababab] cursor-pointer hover:text-red-500"
                            size={20}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 bg-[#1f1f1f] px-3 py-2 rounded-lg">
                          <FaCheckCircle className={`${getStatusColor(group.status_id)}`} size={16} />
                          <span className={`text-xs ${getStatusColor(group.status_id)}`}>
                            {group.status_name}
                          </span>
                        </div>
                        <p className="text-[#f5f5f5] text-md font-bold">
                          {itemPrice.toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* New Cart Items */}
            {cart.length > 0 && (
              <>
                <h2 className="text-xs text-[#ababab] font-medium mb-2 mt-4">
                  New Items to Add
                </h2>
                {cart.map((item) => (
                  <div key={item.id} className="bg-[#1f1f1f] rounded-lg px-4 py-4 mb-2 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                      <h1 className="text-[#ababab] font-semibold tracking-wide text-md">
                        {item.name}
                      </h1>
                      <p className="text-[#ababab] font-semibold">x{item.quantity}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <RiDeleteBin2Fill
                          onClick={() => handleRemove(item.id)}
                          className="text-[#ababab] cursor-pointer hover:text-red-500"
                          size={20}
                        />
                        <FaNotesMedical
                          className="text-[#ababab] cursor-pointer"
                          size={20}
                        />
                      </div>
                      <p className="text-[#f5f5f5] text-md font-bold">{item.price.toLocaleString('vi-VN')}₫</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CartInfo;
