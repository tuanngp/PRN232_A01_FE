'use client';

import { Category } from '@/types/api';

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
  onToggleStatus: (categoryId: number) => void;
  isLoading?: boolean;
}

export function CategoriesTable({ 
  categories, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  isLoading = false 
}: CategoriesTableProps) {
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
            <th className="px-6 py-4 text-left text-black w-[30%] text-sm font-semibold uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-4 text-left text-black w-[15%] text-sm font-semibold uppercase tracking-wider">
              Parent Category
            </th>
            <th className="px-6 py-4 text-left text-black w-[10%] text-sm font-semibold uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-black w-[10%] text-sm font-semibold uppercase tracking-wider">
              Articles
            </th>
            <th className="px-6 py-4 text-left text-black w-[10%] text-sm font-semibold uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {categories.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <span className="material-icons text-4xl text-gray-300 mb-2">category</span>
                  <p>No categories found</p>
                </div>
              </td>
            </tr>
          ) : (
            categories.map((category) => (
              <tr key={category.categoryId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-black text-base font-medium">
                  <div className="max-w-xs truncate" title={category.categoryName}>
                    {category.categoryName}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700 text-base">
                  <div className="max-w-xs truncate" title={category.categoryDescription || ''}>
                    {category.categoryDescription || 'No description'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-base">
                  {category.parentCategory?.categoryName || 'Root Category'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700 text-base">
                  {category.newsArticles?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onToggleStatus(category.categoryId)}
                      className={`${
                        category.isActive 
                          ? 'text-orange-600 hover:text-orange-800' 
                          : 'text-green-600 hover:text-green-800'
                      } transition-colors`}
                      title={category.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <span className="material-icons">
                        {category.isActive ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                    <button
                      onClick={() => onEdit(category)}
                      className="text-black hover:text-gray-700 transition-colors"
                      title="Edit"
                    >
                      <span className="material-icons">edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(category.categoryId)}
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