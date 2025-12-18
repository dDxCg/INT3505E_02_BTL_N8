import type { OrderRead, OrderItemRead, CartItem } from '../types';

/**
 * Order Item Status IDs (based on database schema)
 */
export const ORDER_ITEM_STATUS = {
  PENDING: 1,       // Chờ xác nhận
  COOKING: 2,       // Đang nấu
  READY: 3,         // Sẵn sàng
  SERVED: 4,        // Đã phục vụ
} as const;

/**
 * Order Status IDs (based on database schema)
 */
export const ORDER_STATUS = {
  PENDING: 1,       // Chờ xác nhận
  COOKING: 2,       // Đang nấu
  COMPLETED: 3,     // Hoàn thành
  PAID: 4,          // Đã thanh toán
  CANCELLED: 5,     // Đã hủy
} as const;

/**
 * Timeline Step IDs for the guest order flow
 */
export const TIMELINE_STEP = {
  PLACING: 1,       // Đặt món - User has items in cart
  COOKING: 2,       // Nấu - Items sent to kitchen
  SERVED: 3,        // Phục vụ - All items served
  FINISHED: 4,      // Xong - Order completed/paid
} as const;

/**
 * Check if an order item is in pending or cooking status
 */
function isItemInProgress(item: OrderItemRead): boolean {
  return item.status_id === ORDER_ITEM_STATUS.PENDING ||
         item.status_id === ORDER_ITEM_STATUS.COOKING;
}

/**
 * Check if an order item is ready or served
 */
function isItemReadyOrServed(item: OrderItemRead): boolean {
  return item.status_id === ORDER_ITEM_STATUS.READY ||
         item.status_id === ORDER_ITEM_STATUS.SERVED;
}

/**
 * Check if all items in an order are served
 */
function areAllItemsServed(items: OrderItemRead[]): boolean {
  if (items.length === 0) return false;
  return items.every(item => item.status_id === ORDER_ITEM_STATUS.SERVED);
}

/**
 * Check if an order is active (not completed/paid/cancelled)
 */
export function isOrderActive(order: OrderRead | null): boolean {
  if (!order) return false;
  return order.status_id && order.status_id >= ORDER_STATUS.PENDING && order.status_id <= ORDER_STATUS.COOKING;
}

/**
 * Check if an order is completed, paid, or cancelled
 */
export function isOrderFinished(order: OrderRead | null): boolean {
  if (!order) return false;
  return order.status_id && order.status_id >= ORDER_STATUS.COMPLETED;
}

/**
 * Calculate the timeline step for the guest order flow
 *
 * @param cartItems - Items in the local cart (not yet sent to kitchen)
 * @param activeOrder - The current active order (if any)
 * @param orderItems - Items in the active order (if any)
 * @returns Timeline step number (1-4)
 *
 * Priority Logic:
 * 1. Step 1 (Đặt): User has items in cart waiting to be sent
 * 2. Step 2 (Nấu): Cart empty, active order exists with pending/cooking items
 * 3. Step 3 (Phục vụ): Cart empty, active order exists, all items served
 * 4. Step 4 (Xong): Order is paid/completed or null
 */
export function calculateTimelineStep(
  cartItems: CartItem[],
  activeOrder: OrderRead | null,
  orderItems: OrderItemRead[] = []
): number {
  // RULE 1: If user has items in cart, show "Placing" step
  // This indicates they have new items ready to send
  // Even if there's an active order cooking, new items take priority visually
  if (cartItems.length > 0) {
    return TIMELINE_STEP.PLACING;
  }

  // RULE 2: If no items in cart but active order exists
  if (activeOrder && isOrderActive(activeOrder)) {
    // Check if all items are served
    if (areAllItemsServed(orderItems)) {
      return TIMELINE_STEP.SERVED;
    }

    // If there are items in progress (pending/cooking), show cooking step
    const hasItemsInProgress = orderItems.some(isItemInProgress);
    if (hasItemsInProgress) {
      return TIMELINE_STEP.COOKING;
    }

    // If we have order items but none in progress and not all served
    // This could be a transition state, default to cooking
    if (orderItems.length > 0) {
      return TIMELINE_STEP.COOKING;
    }
  }

  // RULE 3: If order is finished (paid/completed) or no active order
  if (!activeOrder || isOrderFinished(activeOrder)) {
    return TIMELINE_STEP.FINISHED;
  }

  // Default fallback: Show placing step
  return TIMELINE_STEP.PLACING;
}

/**
 * Get user-friendly label for timeline step in Vietnamese
 */
export function getTimelineStepLabel(step: number): string {
  switch (step) {
    case TIMELINE_STEP.PLACING:
      return 'Đang đặt món';
    case TIMELINE_STEP.COOKING:
      return 'Đang nấu';
    case TIMELINE_STEP.SERVED:
      return 'Đã phục vụ';
    case TIMELINE_STEP.FINISHED:
      return 'Hoàn thành';
    default:
      return 'Không xác định';
  }
}

/**
 * Get estimated time message for timeline step
 */
export function getTimelineStepEstimate(step: number): string {
  switch (step) {
    case TIMELINE_STEP.PLACING:
      return 'Sẵn sàng gửi đến bếp';
    case TIMELINE_STEP.COOKING:
      return '15-20 phút';
    case TIMELINE_STEP.SERVED:
      return 'Đang thưởng thức';
    case TIMELINE_STEP.FINISHED:
      return 'Hoàn tất';
    default:
      return '';
  }
}

/**
 * Calculate progress percentage for timeline (0-100)
 */
export function getTimelineProgress(step: number): number {
  switch (step) {
    case TIMELINE_STEP.PLACING:
      return 0;
    case TIMELINE_STEP.COOKING:
      return 33;
    case TIMELINE_STEP.SERVED:
      return 66;
    case TIMELINE_STEP.FINISHED:
      return 100;
    default:
      return 0;
  }
}
