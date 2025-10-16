'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  Home,
  FileStack,
  Settings,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Reports', href: '/reports', icon: FileStack },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname.startsWith('/audits');
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300',
          'flex flex-col',
          isCollapsed ? 'w-20' : 'w-64',
          // Mobile: hidden by default, shown when isMobileOpen
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo/Brand Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <Globe className="w-8 h-8 text-primary" />
              <div className="flex flex-col">
                <span className="font-bold text-sm text-primary">Sales SEO</span>
                <span className="text-xs text-muted-foreground">Rival Digital</span>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/dashboard" className="flex items-center justify-center w-full">
              <Globe className="w-8 h-8 text-primary" />
            </Link>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'hover:bg-gray-100',
                  active && 'bg-primary/10 text-primary border-l-4 border-secondary',
                  !active && 'text-gray-700',
                  isCollapsed && 'justify-center'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-primary')} />
                {!isCollapsed && (
                  <span className={cn('font-medium', active && 'font-semibold')}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4">
          <div className={cn(
            'flex items-center gap-3',
            isCollapsed && 'justify-center'
          )}>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10'
                }
              }}
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-gray-900 truncate">Your Account</span>
                <span className="text-xs text-gray-500">Manage profile</span>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Toggle Button - Desktop only */}
        <button
          onClick={toggleCollapsed}
          className={cn(
            'hidden lg:flex absolute -right-3 top-20 w-6 h-6',
            'items-center justify-center rounded-full',
            'bg-white border-2 border-gray-200',
            'hover:bg-gray-50 transition-colors',
            'z-10'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </aside>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={cn(
          'lg:hidden fixed top-4 left-4 z-50',
          'w-10 h-10 rounded-lg',
          'bg-white border border-gray-200',
          'flex items-center justify-center',
          'hover:bg-gray-50 transition-colors'
        )}
      >
        <div className="flex flex-col gap-1">
          <span className={cn(
            'block w-5 h-0.5 bg-gray-600 transition-all',
            isMobileOpen && 'rotate-45 translate-y-1.5'
          )} />
          <span className={cn(
            'block w-5 h-0.5 bg-gray-600 transition-all',
            isMobileOpen && 'opacity-0'
          )} />
          <span className={cn(
            'block w-5 h-0.5 bg-gray-600 transition-all',
            isMobileOpen && '-rotate-45 -translate-y-1.5'
          )} />
        </div>
      </button>
    </>
  );
}
