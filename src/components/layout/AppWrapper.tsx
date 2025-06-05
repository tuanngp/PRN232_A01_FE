'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Header from './Header';

interface AppWrapperProps {
  children: ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  const pathname = usePathname();
  
  // Define routes that should NOT have header
  const noHeaderRoutes = [
    '/auth/login',
    '/auth/register',
    '/unauthorized'
  ];
  
  const shouldShowHeader = !noHeaderRoutes.includes(pathname);
  
  return (
    <div className="min-h-screen flex flex-col">
      {shouldShowHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 