import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CreditCard, Loader2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderService } from "@/services/order.service"
import { PaymentService } from "@/services/payment.service"
import { getOrderStatusInfo, formatTableNumber } from "@/lib/order-helpers"
import type { Order, OrderItem } from "@/types/schema"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface OrderDetailSheetProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailSheet({
  order,
  open,
  onOpenChange,
}: OrderDetailSheetProps) {
  const queryClient = useQueryClient()

  // Fetch order items
  const {
    data: orderItems = [],
    isLoading: isLoadingItems,
  } = useQuery<OrderItem[]>({
    queryKey: ["order-items", order?.id],
    queryFn: () => OrderService.getItems(order!.id),
    enabled: !!order && open,
  })

  // Fetch order total
  const {
    data: total,
    isLoading: isLoadingTotal,
  } = useQuery<number>({
    queryKey: ["order-total", order?.id],
    queryFn: () => OrderService.getTotal(order!.id),
    enabled: !!order && open,
  })

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: async () => {
      if (!order || !total) throw new Error("Order or total not available")
      
      // Create payment with mock data
      const paymentData = {
        booking_id: order.id,
        currency: "VND",
        amount: total,
        method_id: 1, // cash
        provider_id: 1, // mock provider
      }
      
      return PaymentService.create(paymentData)
    },
    onSuccess: async () => {
      // Update order status to paid (status_id = 3)
      if (order) {
        await OrderService.update(order.id, { status_id: 3 })
        toast.success("Thanh toán thành công!")
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["orders"] })
        queryClient.invalidateQueries({ queryKey: ["order-items", order.id] })
        queryClient.invalidateQueries({ queryKey: ["order-total", order.id] })
      }
    },
    onError: (error: Error) => {
      toast.error(`Lỗi thanh toán: ${error.message || "Không thể thanh toán"}`)
    },
  })

  if (!order) return null

  const statusInfo = getOrderStatusInfo(order.status_id)
  const isPaid = order.status_id === 3

  const handlePay = () => {
    paymentMutation.mutate()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Chi tiết đơn hàng #{order.id}</SheetTitle>
          <SheetDescription>
            {formatTableNumber(order.table_id)}
            {order.guest_id && ` • Khách #${order.guest_id}`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Trạng thái:</span>
            <Badge
              variant={statusInfo.variant}
              className={statusInfo.className}
            >
              {statusInfo.label}
            </Badge>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Danh sách món</h3>
            {isLoadingItems ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-16 flex-1" />
                  </div>
                ))}
              </div>
            ) : orderItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có món nào trong đơn hàng
              </p>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Món</TableHead>
                      <TableHead className="text-center">Số lượng</TableHead>
                      <TableHead className="text-right">Giá</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {item.dish?.name || `Món #${item.dish_id}`}
                            </span>
                            {item.dish?.description && (
                              <span className="text-xs text-muted-foreground">
                                {item.dish.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.dish?.price
                            ? new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(item.dish.price * item.quantity)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Tổng tiền:</span>
              {isLoadingTotal ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                <span className="text-lg font-bold">
                  {total !== undefined
                    ? new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(total)
                    : "-"}
                </span>
              )}
            </div>
          </div>

          {/* Payment Button */}
          {!isPaid && (
            <div className="border-t pt-4">
              <Button
                onClick={handlePay}
                disabled={paymentMutation.isPending || isLoadingTotal || total === undefined}
                className="w-full"
                size="lg"
              >
                {paymentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Thanh toán
                  </>
                )}
              </Button>
            </div>
          )}

          {isPaid && (
            <div className="border-t pt-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                <p className="text-sm text-green-800 dark:text-green-200 text-center">
                  Đơn hàng đã được thanh toán
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

