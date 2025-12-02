import { Users } from 'lucide-react';
import type { TableDashboardItem } from '../../types';

interface TableCardProps {
  table: TableDashboardItem;
  onClick: (tableId: number) => void;
}

export const TableCard = ({ table, onClick }: TableCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-500 text-green-900';
      case 'occupied':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'reserved':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Trống';
      case 'occupied':
        return 'Đang phục vụ';
      case 'reserved':
        return 'Đã đặt';
      default:
        return 'Không xác định';
    }
  };

  return (
    <button
      onClick={() => onClick(table.id)}
      className={`${getStatusColor(
        table.status
      )} border-2 rounded-lg p-4 hover:shadow-lg transition-all transform hover:scale-105 w-full text-left`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold">Bàn {table.number}</h3>
        <div className="flex items-center gap-1 text-sm">
          <Users size={16} />
          <span>{table.seats}</span>
        </div>
      </div>

      <div className="text-sm font-medium mb-2">{getStatusText(table.status)}</div>

      {table.status === 'occupied' && (
        <div className="text-xs space-y-1 pt-2 border-t border-current opacity-75">
          {table.itemCount !== undefined && (
            <div>Món: {table.itemCount}</div>
          )}
          {table.totalAmount !== undefined && (
            <div className="font-medium">
              {table.totalAmount.toLocaleString('vi-VN')}đ
            </div>
          )}
        </div>
      )}
    </button>
  );
};
