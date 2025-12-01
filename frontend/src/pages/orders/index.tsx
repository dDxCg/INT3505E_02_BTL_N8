import { useQuery } from "@tanstack/react-query"
import { RefreshCw, Eye, Plus } from "lucide-react"
import { OrderService } from "@/services/order.service"
import type { Order } from "@/types/schema"
import { getOrderStatusInfo, formatTableNumber } from "@/lib/order-helpers"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateOrderDialog } from "@/features/orders/components/CreateOrderDialog"
import { OrderDetailSheet } from "@/features/orders/components/OrderDetailSheet"
import { useState, useEffect } from "react"

export function Orders() {
  const [refreshing, setRefreshing] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await OrderService.getAll()
      return response
    },
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }


  // Helper function to get user-friendly error message
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes('network') || message.includes('fetch')) {
        return 'Không thể kết nối đến server. Vui lòng kiểm tra xem backend có đang chạy tại http://127.0.0.1:8000 không (Swagger: http://127.0.0.1:8000/docs).'
      }
      if (message.includes('timeout')) {
        return 'Request timeout. Server không phản hồi kịp thời.'
      }
      if (message.includes('cors')) {
        return 'Lỗi CORS. Vui lòng kiểm tra cấu hình CORS trên backend.'
      }
      return error.message
    }
    return 'Đã xảy ra lỗi không xác định'
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Quản lý Đơn hàng</h2>
          </div>
        </div>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 space-y-4">
          <div>
            <p className="text-destructive font-medium mb-2">
              Lỗi khi tải dữ liệu
            </p>
            <p className="text-sm text-muted-foreground">
              {getErrorMessage(error)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
          </div>
          <div className="text-xs text-muted-foreground border-t pt-4 space-y-1">
            <p><strong>Gợi ý khắc phục:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Đảm bảo backend server đang chạy tại http://127.0.0.1:8000</li>
              <li>Kiểm tra Swagger UI tại http://127.0.0.1:8000/docs</li>
              <li>Kiểm tra console browser để xem chi tiết lỗi</li>
              <li>Kiểm tra cấu hình CORS trên backend</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Đơn hàng</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo đơn hàng mới
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading || refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
        </div>
      </div>

      <CreateOrderDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <OrderDetailSheet
        order={selectedOrder}
        open={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
      />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Số bàn</TableHead>
              <TableHead>Thông tin khách</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Không có đơn hàng nào
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const statusInfo = getOrderStatusInfo(order.status_id)
                return (
                  <OrderRow
                    key={order.id}
                    order={order}
                    statusInfo={statusInfo}
                    onRowClick={(order) => {
                      setSelectedOrder(order)
                      setIsDetailSheetOpen(true)
                    }}
                  />
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Separate component for order row to handle async total fetching
function OrderRow({
  order,
  statusInfo,
  onRowClick,
}: {
  order: Order
  statusInfo: ReturnType<typeof getOrderStatusInfo>
  onRowClick: (order: Order) => void
}) {
  const [total, setTotal] = useState<number | null>(null)
  const [loadingTotal, setLoadingTotal] = useState(false)

  // Fetch total when component mounts
  useEffect(() => {
    setLoadingTotal(true)
    OrderService.getTotal(order.id)
      .then((amount) => {
        setTotal(amount)
      })
      .catch(() => {
        setTotal(null)
      })
      .finally(() => {
        setLoadingTotal(false)
      })
  }, [order.id])

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onRowClick(order)}
    >
      <TableCell className="font-medium">#{order.id}</TableCell>
      <TableCell>{formatTableNumber(order.table_id)}</TableCell>
      <TableCell>
        {order.guest_id ? (
          <span className="text-sm">Khách #{order.guest_id}</span>
        ) : (
          <span className="text-sm text-muted-foreground">Không có</span>
        )}
      </TableCell>
      <TableCell>
        <Badge
          variant={statusInfo.variant}
          className={statusInfo.className}
        >
          {statusInfo.label}
        </Badge>
      </TableCell>
      <TableCell>
        {loadingTotal ? (
          <Skeleton className="h-4 w-20 inline-block" />
        ) : total !== null ? (
          <span className="font-medium">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(total)}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onRowClick(order)
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

