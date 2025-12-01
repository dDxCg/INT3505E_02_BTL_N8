// Helper functions for Order status and table mapping

export interface OrderStatusInfo {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

/**
 * Map order status_id to display info
 * Based on constants.txt:
 * 1 = pending (Yellow/Orange)
 * 2 = served (Blue)
 * 3 = paid (Green)
 * 4 = cancelled (Red/Gray)
 */
export function getOrderStatusInfo(statusId: number): OrderStatusInfo {
  switch (statusId) {
    case 1: // pending
      return {
        label: "Đang chờ",
        variant: "outline",
        className: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
      };
    case 2: // served
      return {
        label: "Đã phục vụ",
        variant: "secondary",
        className: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      };
    case 3: // paid
      return {
        label: "Đã thanh toán",
        variant: "default",
        className: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      };
    case 4: // cancelled
      return {
        label: "Đã hủy",
        variant: "destructive",
        className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
      };
    default:
      return {
        label: "Không xác định",
        variant: "outline",
      };
  }
}

/**
 * Format table number display
 * For now, we'll just show "Bàn {table_id}"
 * In the future, this could fetch from /resources/tables to get actual table number
 */
export function formatTableNumber(tableId: number): string {
  return `Bàn ${tableId}`;
}

