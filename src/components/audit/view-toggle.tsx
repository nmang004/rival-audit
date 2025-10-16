'use client';

import { useState, useEffect } from 'react';
import { LayoutGrid, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ViewMode = 'grid' | 'table';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const STORAGE_KEY = 'audit-view-mode';

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('grid')}
        className={`gap-2 ${
          value === 'grid'
            ? 'bg-primary text-white hover:bg-primary hover:text-white'
            : 'hover:bg-gray-200 text-gray-700'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        Grid
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('table')}
        className={`gap-2 ${
          value === 'table'
            ? 'bg-primary text-white hover:bg-primary hover:text-white'
            : 'hover:bg-gray-200 text-gray-700'
        }`}
      >
        <Table2 className="w-4 h-4" />
        Table
      </Button>
    </div>
  );
}

/**
 * Hook to manage view mode with localStorage persistence
 */
export function useViewMode(storageKey: string = STORAGE_KEY): [ViewMode, (mode: ViewMode) => void] {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'grid' || stored === 'table') {
      setViewMode(stored);
    }
  }, [storageKey]);

  // Save to localStorage when changed
  const handleChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(storageKey, mode);
  };

  return [viewMode, handleChange];
}
