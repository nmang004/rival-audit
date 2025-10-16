'use client';

import { useState } from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HeaderProps {
  sidebarCollapsed?: boolean;
}

export function Header({ sidebarCollapsed = false }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const hasNotifications = true; // TODO: Replace with actual notification state

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-30',
        'transition-all duration-300',
        'flex items-center gap-4 px-6',
        // Adjust left margin based on sidebar state
        sidebarCollapsed ? 'left-20' : 'left-64',
        'lg:left-64', // Desktop always accounts for sidebar
        'lg:' + (sidebarCollapsed ? 'left-20' : 'left-64')
      )}
      style={{
        left: sidebarCollapsed ? '5rem' : '16rem',
      }}
    >
      {/* Global Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search audits, reports, clients... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 w-full bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Help/Docs Link */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex items-center gap-2"
          asChild
        >
          <a
            href="https://docs.claude.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden lg:inline">Help</span>
          </a>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              {hasNotifications && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 w-2 h-2 p-0 rounded-full"
                >
                  <span className="sr-only">New notifications</span>
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {/* Placeholder notifications */}
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
                <div className="flex items-center gap-2 w-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="font-medium text-sm">Audit Completed</span>
                  <span className="ml-auto text-xs text-gray-500">2m ago</span>
                </div>
                <p className="text-sm text-gray-600">
                  Your audit for example.com is ready to view
                </p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
                <div className="flex items-center gap-2 w-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="font-medium text-sm">Report Generated</span>
                  <span className="ml-auto text-xs text-gray-500">1h ago</span>
                </div>
                <p className="text-sm text-gray-600">
                  Your PDF report is ready to download
                </p>
              </DropdownMenuItem>
            </div>
            <div className="border-t p-2">
              <Button variant="ghost" size="sm" className="w-full">
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
