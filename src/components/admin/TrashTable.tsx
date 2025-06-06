'use client';

import { TrashItem } from '@/types/api';

interface TrashTableProps {
  items: TrashItem[];
  onRestore: (item: TrashItem) => void;
  onPermanentDelete: (item: TrashItem) => void;
  isLoading?: boolean;
}

export function TrashTable({ 
  items, 
  onRestore, 
  onPermanentDelete, 
  isLoading = false 
}: TrashTableProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news': return 'article';
      case 'category': return 'category';
      case 'tag': return 'sell';
      case 'account': return 'person';
      default: return 'help';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'news': return 'text-blue-600';
      case 'category': return 'text-green-600';
      case 'tag': return 'text-orange-600';
      case 'account': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'news': return 'Tin tức';
      case 'category': return 'Danh mục';
      case 'tag': return 'Thẻ';
      case 'account': return 'Tài khoản';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày xóa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người xóa
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-48 h-4 bg-gray-200 rounded"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-icons text-6xl text-gray-300 mb-4">delete_outline</span>
        <h3 className="text-xl font-medium text-gray-500 mb-2">Thùng rác trống</h3>
        <p className="text-gray-400">Không có mục nào trong thùng rác</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loại
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tiêu đề
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày xóa
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Người xóa
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className={`material-icons ${getTypeColor(item.type)}`}>
                    {getTypeIcon(item.type)}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {getTypeName(item.type)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {item.title}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(item.deletedDate).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.deletedBy || 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onRestore(item)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Khôi phục"
                  >
                    <span className="material-icons text-lg">restore</span>
                  </button>
                  <button
                    onClick={() => onPermanentDelete(item)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa vĩnh viễn"
                  >
                    <span className="material-icons text-lg">delete_forever</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 