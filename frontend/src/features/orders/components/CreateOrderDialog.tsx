import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { OrderService } from "@/services/order.service"
import { ResourceService } from "@/services/resource.service"
import type { OrderCreate } from "@/types/schema"

// Zod schema based on OrderCreate
const createOrderSchema = z.object({
  table_id: z
    .number({ required_error: "Vui lòng chọn bàn" })
    .min(1, "Vui lòng chọn bàn"),
  guest_id: z
    .string()
    .optional()
    .transform((val) => (val === "" || val === undefined ? null : Number(val)))
    .pipe(z.number().nullable().optional()),
})

type CreateOrderFormData = z.infer<typeof createOrderSchema>

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateOrderDialog({
  open,
  onOpenChange,
}: CreateOrderDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      table_id: undefined as any,
      guest_id: undefined,
    },
  })

  // Fetch tables
  const {
    data: tables = [],
    isLoading: isLoadingTables,
  } = useQuery({
    queryKey: ["tables"],
    queryFn: () => ResourceService.getTables(),
  })

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderCreate) => {
      return OrderService.create(data)
    },
    onSuccess: () => {
      toast.success("Tạo đơn hàng thành công!")
      reset()
      onOpenChange(false)
      // Invalidate orders query to refetch
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message || "Không thể tạo đơn hàng"}`)
    },
  })

  const onSubmit = (data: CreateOrderFormData) => {
    const orderData: OrderCreate = {
      table_id: data.table_id,
      guest_id: data.guest_id ?? null,
      status_id: 1, // Default to pending
    }
    createOrderMutation.mutate(orderData)
  }

  const tableId = watch("table_id")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo đơn hàng mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo đơn hàng mới cho nhà hàng
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="table_id">
              Số bàn <span className="text-destructive">*</span>
            </Label>
            <Select
              value={tableId?.toString() || ""}
              onValueChange={(value) => {
                setValue("table_id", Number(value), { shouldValidate: true })
                trigger("table_id")
              }}
              disabled={isLoadingTables}
            >
              <SelectTrigger id="table_id" className="w-full">
                <SelectValue placeholder="Chọn bàn" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingTables ? (
                  <SelectItem value="loading" disabled>
                    Đang tải...
                  </SelectItem>
                ) : tables.length === 0 ? (
                  <SelectItem value="no-tables" disabled>
                    Không có bàn nào
                  </SelectItem>
                ) : (
                  tables.map((table) => (
                    <SelectItem key={table.id} value={table.id.toString()}>
                      Bàn {table.number} ({table.seats} chỗ)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.table_id && (
              <p className="text-sm text-destructive">
                {errors.table_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest_id">Mã khách hàng (Tùy chọn)</Label>
            <Input
              id="guest_id"
              type="number"
              placeholder="Nhập mã khách hàng"
              {...register("guest_id")}
            />
            {errors.guest_id && (
              <p className="text-sm text-destructive">
                {errors.guest_id.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset({
                  table_id: undefined as any,
                  guest_id: undefined,
                })
                onOpenChange(false)
              }}
              disabled={isSubmitting || createOrderMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createOrderMutation.isPending || isLoadingTables}
            >
              {isSubmitting || createOrderMutation.isPending
                ? "Đang tạo..."
                : "Tạo đơn hàng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

