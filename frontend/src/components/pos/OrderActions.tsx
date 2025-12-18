import { Printer, FileText, DollarSign } from 'lucide-react';

interface OrderActionsProps {
  onKOTPrint: () => void;
  onDraft: () => void;
  onBillPayment: () => void;
  onBillPrint: () => void;
  disabled?: boolean;
  hasPendingItems?: boolean;
}

export function OrderActions({
  onKOTPrint,
  onDraft,
  onBillPayment,
  onBillPrint,
  disabled,
  hasPendingItems
}: OrderActionsProps) {
  return (
    <div className="space-y-3 pt-4 border-t border-gray-200">
      {/* Row 1: KOT & Print + Draft */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onKOTPrint}
          disabled={disabled}
          className="bg-[#1F2937] text-white py-3 px-4 rounded-lg font-medium text-sm hover:bg-[#374151] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Printer size={16} />
          KOT & Print
        </button>

        <button
          onClick={onDraft}
          disabled={disabled}
          className="bg-white text-gray-700 py-3 px-4 rounded-lg font-medium text-sm border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FileText size={16} />
          Draft
        </button>
      </div>

      {/* Row 2: Bill & Payment + Bill & Print */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onBillPayment}
          disabled={disabled || hasPendingItems}
          className="bg-[#FF6B2C] text-white py-3 px-4 rounded-lg font-medium text-sm hover:bg-[#ff5511] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <DollarSign size={16} />
          Bill & Payment
        </button>

        <button
          onClick={onBillPrint}
          disabled={disabled || hasPendingItems}
          className="bg-[#10B981] text-white py-3 px-4 rounded-lg font-medium text-sm hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Printer size={16} />
          Bill & Print
        </button>
      </div>

      {hasPendingItems && (
        <p className="text-xs text-yellow-600 text-center mt-2">
          Please serve all items before completing payment
        </p>
      )}
    </div>
  );
}
