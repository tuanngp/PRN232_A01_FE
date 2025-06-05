'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  {
    href: '/admin',
    icon: 'dashboard',
    label: 'Dashboard'
  },
  {
    href: '/admin/news',
    icon: 'article',
    label: 'Articles'
  },
  {
    href: '/admin/categories',
    icon: 'category',
    label: 'Categories'
  },
  {
    href: '/admin/tags',
    icon: 'sell',
    label: 'Tags'
  },
  {
    href: '/admin/accounts',
    icon: 'people',
    label: 'Accounts'
  },
  {
    href: '/admin/settings',
    icon: 'settings',
    label: 'Settings'
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="flex flex-col w-72 bg-gray-50 border-r border-gray-200 p-6">
      <div className="flex flex-col gap-8">
        <h1 className="text-black text-2xl font-bold leading-tight">FU News</h1>
        
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group
                  ${isActive 
                    ? 'text-black bg-gray-200' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  }
                `}
              >
                <span 
                  className={`
                    material-icons
                    ${isActive 
                      ? 'text-black' 
                      : 'text-gray-500 group-hover:text-black'
                    }
                  `}
                >
                  {item.icon}
                </span>
                <p className="text-base font-medium">{item.label}</p>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-black rounded-lg transition-colors w-full group"
        >
          <span className="material-icons text-gray-500 group-hover:text-black">logout</span>
          <p className="text-base font-medium">Logout</p>
        </button>
      </div>
    </aside>
  );
} 