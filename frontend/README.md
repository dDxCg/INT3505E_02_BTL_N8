# Restaurant Frontend (Haidilao Style)

Frontend application cho hệ thống nhà hàng phong cách Haidilao, hỗ trợ 2 luồng chính:
- **Guest**: Quét QR → Xem menu → Order
- **Staff**: Quản lý bàn → Theo dõi order → Thanh toán

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **State Management**: Zustand (Cart state)
- **Server State**: TanStack Query (React Query v5)
- **Networking**: Axios
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router v6

## Cấu trúc dự án

```
frontend/
├── src/
│   ├── api/              # API client & services
│   │   ├── client.ts     # Axios instance
│   │   └── services.ts   # API endpoints
│   ├── components/       # React components
│   │   ├── guest/        # Guest components (DishCard, Cart)
│   │   ├── staff/        # Staff components (TableCard, OrderItemCard)
│   │   └── shared/       # Shared components
│   ├── hooks/            # Custom hooks
│   │   └── useApi.ts     # React Query hooks
│   ├── pages/            # Pages/Routes
│   │   ├── guest/        # MenuPage
│   │   └── staff/        # DashboardPage, TableDetailPage
│   ├── stores/           # Zustand stores
│   │   └── cartStore.ts  # Cart state management
│   ├── types/            # TypeScript types
│   │   └── index.ts      # All type definitions
│   ├── App.tsx           # Main app with routes
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── .env.example          # Environment variables template
└── package.json
```

## Installation

### Prerequisites
- Node.js 18+
- npm hoặc yarn

### Steps

1. **Clone repository và di chuyển vào thư mục frontend**
   ```bash
   cd frontend
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Tạo file .env từ .env.example**
   ```bash
   cp .env.example .env
   ```

4. **Cấu hình biến môi trường trong .env**
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```

5. **Chạy development server**
   ```bash
   npm run dev
   ```

   App sẽ chạy tại: http://localhost:5173

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Luồng sử dụng

### 1. Guest Flow (Khách hàng)

**URL**: `/menu?tableId=1`

1. Khách hàng quét QR code tại bàn (chứa tableId)
2. Xem menu và tìm kiếm món ăn
3. Thêm món vào giỏ hàng (lưu local với Zustand + persist)
4. Điều chỉnh số lượng hoặc xóa món
5. Nhấn "Gửi order đến bếp"
6. Hệ thống tạo Order và OrderItems qua API

**Features**:
- Real-time cart updates
- Persistent cart (localStorage)
- Search dishes
- Responsive mobile-first design
- Visual feedback when adding items

### 2. Staff Flow (Nhân viên)

**URL**: `/staff`

#### Dashboard
- Hiển thị sơ đồ tất cả bàn
- Màu sắc theo trạng thái:
  - 🟢 Xanh: Bàn trống (available)
  - 🔴 Đỏ: Đang phục vụ (occupied)
  - 🟡 Vàng: Đã đặt (reserved)
- Thống kê: Tổng bàn, bàn phục vụ, bàn trống
- Click vào bàn để xem chi tiết

#### Chi tiết bàn (`/staff/table/:tableId`)
- Danh sách món trong order:
  - **Đang chờ** (pending) - món chưa phục vụ
  - **Đã phục vụ** (served) - món đã mang ra
- Đánh dấu món đã phục vụ
- Tính tổng tiền tự động
- Thanh toán và đóng order

**Features**:
- Real-time order updates (auto-refresh với React Query)
- Status management
- Payment processing
- Order completion workflow

## API Integration

### Base URL
Default: `http://localhost:8000/api/v1`

### Key Endpoints Used

**Dishes** (Menu)
- `GET /resources/dishes/` - Lấy danh sách món ăn

**Tables** (Bàn)
- `GET /tables` - Lấy danh sách bàn
- `GET /tables/:id` - Chi tiết bàn

**Orders** (Đơn hàng)
- `POST /orders` - Tạo order mới
- `GET /orders?table_id=1&status_id=1` - Lấy orders theo bàn
- `PUT /orders/:id` - Cập nhật order (status)
- `GET /orders/:id/total` - Tính tổng tiền

**Order Items** (Món trong đơn)
- `POST /orders/items/` - Thêm món vào order
- `GET /orders/items/?order_id=1` - Lấy món theo order
- `PUT /orders/items/:id` - Cập nhật trạng thái món
- `DELETE /orders/items/:id` - Xóa món

**Payments** (Thanh toán)
- `POST /payments` - Tạo payment record

### React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});
```

## State Management

### Zustand Store (Cart)

```typescript
interface CartState {
  items: CartItem[];
  addItem: (dish: Dish, quantity?: number) => void;
  removeItem: (dishId: number) => void;
  updateQuantity: (dishId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}
```

**Persistence**: Cart được lưu vào localStorage với key `restaurant-cart-storage`

## Styling

### Tailwind CSS

Sử dụng utility-first approach:
- Responsive design: `sm:`, `md:`, `lg:`, `xl:`
- Custom colors: `red-600` (Haidilao theme)
- Hover states: `hover:bg-red-700`
- Transitions: `transition-colors`, `transition-shadow`

### Custom Theme

```javascript
colors: {
  'haidilao-red': {
    DEFAULT: '#DC2626',
    // ... variants
  },
}
```

## Type Safety

Tất cả types được định nghĩa trong `src/types/index.ts`:
- Backend model types (Table, Dish, Order, etc.)
- API schemas (Create, Update, Filter)
- Client-side types (CartState, TableStatus)
- Extended types with relations (OrderRead, OrderItemRead)

## Development Tips

### Hot Module Replacement (HMR)
Vite cung cấp HMR nhanh chóng - thay đổi code sẽ reflect ngay lập tức

### API Debugging
- Axios interceptors log errors tự động
- React Query DevTools có thể được thêm vào để debug queries

### Mock Data
Nếu backend chưa sẵn sàng, có thể mock API responses trong `services.ts`

## Deployment

### Build Production

```bash
npm run build
```

Output: `dist/` folder

### Environment Variables

Đảm bảo set `VITE_API_URL` đúng cho production:
```env
VITE_API_URL=https://api.yourrestaurant.com/api/v1
```

### Deploy Options
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **Static hosting**: Upload `dist/` folder

## Troubleshooting

### CORS Issues
Đảm bảo backend đã cấu hình CORS cho frontend URL:
```python
# FastAPI backend
allow_origins=["http://localhost:5173"]
```

### API Connection Failed
- Kiểm tra `VITE_API_URL` trong `.env`
- Đảm bảo backend đang chạy
- Check network tab trong DevTools

### Cart Not Persisting
- Clear localStorage: `localStorage.clear()`
- Check browser console for errors
- Verify Zustand persist middleware

## Future Enhancements

- [ ] Authentication (Staff login)
- [ ] Real-time updates với WebSocket
- [ ] QR code generator cho bàn
- [ ] Multiple payment methods
- [ ] Order history & analytics
- [ ] Dark mode support
- [ ] Multi-language support (i18n)
- [ ] PWA support (offline mode)

## Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is for educational purposes.

## Contact

For questions or support, please open an issue in the repository.
