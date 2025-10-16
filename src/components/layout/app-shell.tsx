'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sync with sidebar's collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState));
    }

    // Listen for localStorage changes
    const handleStorageChange = () => {
      const state = localStorage.getItem('sidebarCollapsed');
      if (state !== null) {
        setSidebarCollapsed(JSON.parse(state));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Poll for changes (for same-tab updates)
    const interval = setInterval(() => {
      const state = localStorage.getItem('sidebarCollapsed');
      if (state !== null && JSON.parse(state) !== sidebarCollapsed) {
        setSidebarCollapsed(JSON.parse(state));
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [sidebarCollapsed]);

  // Don't show app shell on public pages (e.g., share links, landing page)
  const isPublicPage = pathname.startsWith('/share') || pathname === '/';

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <Header sidebarCollapsed={sidebarCollapsed} />

      {/* Main Content Area */}
      <main
        className={cn(
          'pt-16 transition-all duration-300',
          // Adjust left margin based on sidebar state
          'lg:' + (sidebarCollapsed ? 'ml-20' : 'ml-64')
        )}
        style={{
          marginLeft: sidebarCollapsed ? '5rem' : '16rem',
        }}
      >
        {/* Audit detail pages have their own header, so don't wrap in container */}
        {pathname.startsWith('/audits/') && pathname.includes('/audits/') ? (
          <>
            {/* Breadcrumbs for audit detail */}
            <div className="container mx-auto px-4 pt-6 max-w-7xl">
              <Breadcrumbs />
            </div>
            {/* Page Content without extra padding/container */}
            {children}
          </>
        ) : (
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Breadcrumbs */}
            <Breadcrumbs />

            {/* Page Content */}
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
