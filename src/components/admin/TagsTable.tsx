'use client';

import { Tag } from '@/types/api';

interface TagsTableProps {
  tags: Tag[];
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: number) => void;
  isLoading?: boolean;
}

export function TagsTable({ 
  tags, 
  onEdit, 
  onDelete, 
  isLoading = false 
}: TagsTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
        <div className="animate-pulse">
          <div className="bg-gray-50 h-16"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-gray-200 h-16 bg-gray-50"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white @container">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-black w-[25%] text-sm font-semibold uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 text-left text-black w-[40%] text-sm font-semibold uppercase tracking-wider">
              Note
            </th>
            <th className="px-6 py-4 text-left text-black w-[15%] text-sm font-semibold uppercase tracking-wider">
              Articles Count
            </th>
            <th className="px-6 py-4 text-left text-black w-[10%] text-sm font-semibold uppercase tracking-wider">
              Created Date
            </th>
            <th className="px-6 py-4 text-left text-black w-[10%] text-sm font-semibold uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tags.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <span className="material-icons text-4xl text-gray-300 mb-2">local_offer</span>
                  <p>No tags found</p>
                </div>
              </td>
            </tr>
          ) : (
            tags.map((tag) => (
              <tr key={tag.tagId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-black text-base font-medium">
                  <div className="max-w-xs truncate" title={tag.tagName}>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tag.tagName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700 text-base">
                  <div className="max-w-xs truncate" title={tag.note || ''}>
                    {tag.note || 'No note'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-base">
                  {tag.newsArticles?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-base">
                  {tag.createdDate ? new Date(tag.createdDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(tag)}
                      className="text-black hover:text-gray-700 transition-colors"
                      title="Edit"
                    >
                      <span className="material-icons">edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(tag.tagId)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 