# Type System Documentation

## Overview

File `schema.ts` chứa TypeScript interfaces khớp **100%** với Backend Pydantic schemas. Đây là "ngôn ngữ chung" giữa Frontend và Backend.

## Mapping: Backend ↔ Frontend

### Data Type Conversions

| Backend Type | Frontend Type | Notes |
|--------------|---------------|-------|
| `int` | `number` | Integer |
| `str` | `string` | String |
| `Decimal` | `number` | Price/Money - Backend dùng Decimal cho độ chính xác |
| `Optional[T]` | `T \| null \| undefined` | Nullable fields |
| `datetime` | `string` | ISO 8601 datetime string |

### Key Schema Mappings

#### 1. **Dish (Món ăn)**

Backend:
```python
class DishRead(BaseModel):
    id: int
    name: str
    price: Decimal
    description: str | None = None
```

Frontend:
```typescript
interface DishRead {
  id: number;
  name: string;
  price: number;  // Decimal → number
  description?: string | null;
}
```

**IMPORTANT**: `price` là `number` ở Frontend, nhưng Backend dùng `Decimal` cho độ chính xác cao. Khi hiển thị giá tiền, nên format với `.toFixed(2)` hoặc `.toLocaleString('vi-VN')`.

#### 2. **OrderItem (Món trong đơn)**

Backend:
```python
class OrderItemCreate(BaseModel):
    order_id: int
    dish_id: int
    quantity: int = Field(..., gt=0)
    status_id: int  # REQUIRED
```

Frontend:
```typescript
interface OrderItemCreate {
  order_id: number;
  dish_id: number;
  quantity: number;  // Must be > 0
  status_id: number;  // REQUIRED - Don't forget!
}
```

**IMPORTANT**: `status_id` là **bắt buộc** khi tạo OrderItem. Thường dùng:
- `status_id: 1` = Pending (Đang chờ)
- `status_id: 2` = Served (Đã phục vụ)

#### 3. **Order (Đơn hàng)**

Backend:
```python
class OrderCreate(BaseModel):
    table_id: int
    guest_id: Optional[int] = None
    status_id: Optional[int] = None  # Default = 1
```

Frontend:
```typescript
interface OrderCreate {
  table_id: number;
  guest_id?: number | null;
  status_id?: number | null;  // Backend defaults to 1 if not provided
}
```

**NOTE**: Backend tự động set `status_id = 1` (pending) nếu không truyền.

## Status ID Reference

### Order Status
- `1` - Pending (Đang chờ)
- `2` - Processing (Đang xử lý)
- `3` - Completed (Hoàn thành)
- `4` - Cancelled (Đã hủy)

### Order Item Status
- `1` - Pending (Chưa lên món)
- `2` - Served (Đã lên món)
- `3` - Cancelled (Đã hủy)

## Extended Types

File `schema.ts` cũng chứa **Extended Types** để sử dụng ở Frontend:

### OrderItemRead
```typescript
interface OrderItemRead extends OrderItemBase {
  dish: DishRead;           // Populated dish object
  status: OrderItemStatusRead;  // Populated status object
}
```

Backend trả về populated objects khi dùng `selectinload()` trong SQLAlchemy.

### TableWithStatus
```typescript
interface TableWithStatus extends TableRead {
  status: 'available' | 'occupied' | 'reserved';
  currentOrder?: OrderWithItems;
}
```

Đây là type do Frontend tự tạo để quản lý trạng thái bàn.

## Validation Rules

### Quantity
- Must be `> 0` (Backend validates với `Field(..., gt=0)`)
- Frontend nên validate trước khi gửi API

### Rating (Feedback)
- Range: `1-5` (Backend validates với `Field(..., ge=1, le=5)`)
- Frontend nên có star rating UI

### Table Number
- Must be `> 0` (Backend validates với `Field(..., gt=0)`)
- Unique constraint tại database level

## Usage Examples

### Creating an Order (Guest Flow)

```typescript
import { createOrder, addOrderItem } from '@/services/api';
import type { OrderCreate, OrderItemCreate } from '@/types/schema';

// Step 1: Create order
const orderData: OrderCreate = {
  table_id: 1,
  // status_id defaults to 1 (pending)
};
const order = await createOrder(orderData);

// Step 2: Add items to order
const itemData: OrderItemCreate = {
  order_id: order.id,
  dish_id: 5,
  quantity: 2,
  status_id: 1,  // Don't forget status_id!
};
await addOrderItem(itemData);
```

### Updating Item Status (Staff Flow)

```typescript
import { updateItemStatus } from '@/services/api';
import type { OrderItemUpdate } from '@/types/schema';

// Mark item as served
const updateData: OrderItemUpdate = {
  status_id: 2,  // 2 = Served
};
await updateItemStatus(itemId, updateData);
```

### Closing Order (Staff Payment)

```typescript
import { updateOrder } from '@/services/api';
import type { OrderUpdate } from '@/types/schema';

// Close order after payment
const updateData: OrderUpdate = {
  status_id: 3,  // 3 = Completed
};
await updateOrder(orderId, updateData);
```

## Common Pitfalls

### ❌ Forgetting status_id in OrderItemCreate
```typescript
// WRONG - Backend will return validation error
const itemData = {
  order_id: 1,
  dish_id: 5,
  quantity: 2,
  // Missing status_id!
};
```

### ❌ Wrong price type
```typescript
// WRONG - price should be number, not string
const dish: DishRead = {
  id: 1,
  name: "Phở",
  price: "50000",  // Should be: 50000 (number)
};
```

### ✅ Correct Implementation
```typescript
const itemData: OrderItemCreate = {
  order_id: 1,
  dish_id: 5,
  quantity: 2,
  status_id: 1,  // ✅ Correct!
};

const dish: DishRead = {
  id: 1,
  name: "Phở",
  price: 50000,  // ✅ Correct - number type
};
```

## Type Safety Benefits

1. **Compile-time checking**: TypeScript sẽ báo lỗi nếu thiếu field hoặc sai type
2. **Autocomplete**: IDE sẽ suggest fields và types
3. **Refactoring safety**: Khi Backend schema thay đổi, chỉ cần update `schema.ts` là TypeScript sẽ báo lỗi tất cả nơi cần sửa
4. **Documentation**: Types là documentation tốt nhất

## Updating Schemas

Khi Backend schema thay đổi:

1. Đọc file `backend-specs.txt` hoặc Backend code
2. Update interfaces trong `schema.ts`
3. TypeScript sẽ tự động báo lỗi tất cả nơi cần sửa
4. Fix các lỗi TypeScript
5. Test lại API calls

## References

- Backend Pydantic schemas: `backend/schemas/`
- Backend models: `backend/models/`
- Backend specs: `backend-specs.txt`
