import { AccountRole } from '@/types/api';
import { useEffect, useRef, useState } from 'react';

interface DeleteMenuProps {
  onSoftDelete: () => void;
  onHardDelete?: () => void;
  userRole?: AccountRole;
  disabled?: boolean;
  className?: string;
}

export function DeleteDropdownMenu({
  onSoftDelete,
  onHardDelete,
  userRole,
  disabled = false,
  className = ''
}: DeleteMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = userRole === AccountRole.Admin;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSoftDelete = () => {
    setIsOpen(false);
    onSoftDelete();
  };

  const handleHardDelete = () => {
    if (onHardDelete) {
      setIsOpen(false);
      onHardDelete();
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        className={`inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <svg
          className="h-4 w-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Xóa
        <svg
          className="ml-1 h-4 w-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10">
          <div className="py-1">
            <button
              className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
              onClick={handleSoftDelete}
            >
              <svg
                className="mr-3 h-4 w-4 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12l-1.41-1.41L13 16.17l-4.59-4.58L7 13l6 6 12-12z"
                />
              </svg>
              Xóa tạm thời
              <span className="ml-auto text-xs text-gray-500">Có thể khôi phục</span>
            </button>
          </div>

          {isAdmin && onHardDelete && (
            <div className="py-1">
              <button
                className="group flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900 w-full text-left"
                onClick={handleHardDelete}
              >
                <svg
                  className="mr-3 h-4 w-4 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Xóa vĩnh viễn
                <span className="ml-auto text-xs text-red-500">Không thể khôi phục</span>
              </button>
            </div>
          )}

          {!isAdmin && (
            <div className="py-1">
              <div className="flex items-center px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                <svg
                  className="mr-3 h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m0 0v2m0-2h2m-2 0h-2m-3-2l.917 11.923A1 1 0 018.92 17h6.16a1 1 0 01.996 1.077L16 17m-8 0V5a2 2 0 012-2h4a2 2 0 012 2v12m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v8.001"
                  />
                </svg>
                Xóa vĩnh viễn
                <span className="ml-auto text-xs text-gray-400">Chỉ Admin</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Simplified delete button for single action
interface SimpleDeleteButtonProps {
  onDelete: () => void;
  disabled?: boolean;
  variant?: 'soft' | 'hard';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SimpleDeleteButton({
  onDelete,
  disabled = false,
  variant = 'soft',
  size = 'md',
  className = ''
}: SimpleDeleteButtonProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    soft: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    hard: 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <button
      type="button"
      className={`
        inline-flex items-center justify-center rounded-md border border-transparent shadow-sm font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${variant === 'soft' ? 'focus:ring-yellow-500' : 'focus:ring-red-500'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={onDelete}
      disabled={disabled}
    >
      <svg
        className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
      {variant === 'soft' ? 'Xóa' : 'Xóa vĩnh viễn'}
    </button>
  );
} 