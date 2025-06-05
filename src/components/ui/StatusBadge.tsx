import { NewsStatus } from '@/types/api';

interface StatusBadgeProps {
  status: NewsStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const isActive = status === NewsStatus.Active;
  
  return (
    <span 
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold
        ${isActive 
          ? 'bg-green-100 text-green-700' 
          : 'bg-yellow-100 text-yellow-700'
        }
        ${className}
      `}
    >
      <span className="material-icons text-sm mr-1.5">
        {isActive ? 'check_circle' : 'pause_circle'}
      </span>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
} 