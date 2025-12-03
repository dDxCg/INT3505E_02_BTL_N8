import { Edit2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface OrderSummaryProps {
  subtotal: number;
  productDiscount?: number;
  extraDiscount?: number;
  couponDiscount?: number;
  total: number;
}

export function OrderSummary({
  subtotal,
  productDiscount = 0,
  extraDiscount = 0,
  couponDiscount = 0,
  total
}: OrderSummaryProps) {
  return (
    <div className="space-y-2 py-4 border-t border-gray-200">
      {/* Sub total */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Sub total :</span>
        <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
      </div>

      {/* Product Discount */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Product Discount :</span>
        <span className="font-semibold text-gray-900">{formatCurrency(productDiscount)}</span>
      </div>

      {/* Extra Discount */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Extra Discount :</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{formatCurrency(extraDiscount)}</span>
          <button className="text-gray-400 hover:text-gray-600">
            <Edit2 size={14} />
          </button>
        </div>
      </div>

      {/* Coupon Discount */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Coupon discount :</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{formatCurrency(couponDiscount)}</span>
          <button className="text-gray-400 hover:text-gray-600">
            <Edit2 size={14} />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between text-base font-bold pt-2 border-t border-gray-200">
        <span className="text-gray-900">Total :</span>
        <span className="text-gray-900">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
