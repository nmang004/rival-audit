'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeSelectorProps {
  value: 'LIGHT' | 'DARK' | 'AUTO';
  onChange: (value: 'LIGHT' | 'DARK' | 'AUTO') => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const options = [
    { value: 'LIGHT' as const, label: 'Light', icon: Sun },
    { value: 'DARK' as const, label: 'Dark', icon: Moon },
    { value: 'AUTO' as const, label: 'Auto', icon: Monitor },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all
              ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }
            `}
            aria-label={`Select ${option.label} theme`}
            aria-pressed={isSelected}
          >
            <Icon className="w-6 h-6" />
            <span className="text-sm font-medium">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
