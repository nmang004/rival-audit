'use client';

import React, { useState, useEffect } from 'react';

interface ColorPickerProps {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  helpText?: string;
}

/**
 * Color picker component that supports OKLCH color format
 * Converts hex to OKLCH and displays a color swatch
 */
export function ColorPicker({
  label,
  value,
  onChange,
  helpText,
}: ColorPickerProps) {
  const [hexColor, setHexColor] = useState('#002264');

  // Convert OKLCH to approximate hex for display
  useEffect(() => {
    if (value) {
      // Extract OKLCH values and convert to approximate hex
      const oklchMatch = value.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
      if (oklchMatch) {
        // This is a simplified conversion - in production you'd use a proper color conversion library
        const l = parseFloat(oklchMatch[1]);
        const c = parseFloat(oklchMatch[2]);
        const h = parseFloat(oklchMatch[3]);

        // Simple heuristic conversion for common colors
        if (h >= 260 && h <= 270 && c > 0.1) {
          setHexColor('#002264'); // Navy blue
        } else if (h >= 50 && h <= 70 && c > 0.1) {
          setHexColor('#f78d30'); // Orange
        }
      }
    }
  }, [value]);

  const handleColorChange = (hex: string) => {
    setHexColor(hex);

    // Convert hex to OKLCH (simplified conversion)
    // In production, use a proper color conversion library like 'culori'
    const oklch = hexToOKLCH(hex);
    onChange(oklch);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex gap-3 items-center">
        <div className="relative">
          <input
            type="color"
            value={hexColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-14 h-14 rounded-lg border-2 border-gray-300 cursor-pointer overflow-hidden"
            style={{
              backgroundColor: hexColor,
            }}
          />
        </div>

        <div className="flex-1">
          <input
            type="text"
            value={hexColor}
            onChange={(e) => handleColorChange(e.target.value)}
            placeholder="#000000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          />
        </div>

        <div className="text-xs text-gray-500 font-mono bg-gray-100 px-3 py-2 rounded-lg">
          {value || 'oklch(...)'}
        </div>
      </div>

      {helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
}

/**
 * Simplified hex to OKLCH conversion
 * In production, use a proper color conversion library like 'culori'
 */
function hexToOKLCH(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // Simple heuristic for common colors
  // In production, implement proper RGB -> OKLCH conversion
  if (r < 0.1 && g < 0.2 && b > 0.3) {
    // Navy blue range
    return 'oklch(0.24 0.13 265)';
  } else if (r > 0.8 && g > 0.4 && b < 0.3) {
    // Orange range
    return 'oklch(0.71 0.15 60)';
  } else if (r < 0.2 && g < 0.2 && b < 0.2) {
    // Dark colors
    const l = (r + g + b) / 3;
    return `oklch(${l.toFixed(2)} 0 0)`;
  } else if (r > 0.8 && g > 0.8 && b > 0.8) {
    // Light colors
    const l = (r + g + b) / 3;
    return `oklch(${l.toFixed(2)} 0 0)`;
  } else {
    // Default conversion - very simplified
    const l = (0.2126 * r + 0.7152 * g + 0.0722 * b);
    const c = Math.sqrt(Math.pow(r - l, 2) + Math.pow(g - l, 2) + Math.pow(b - l, 2));

    // Approximate hue
    let h = 0;
    if (c > 0) {
      if (r >= g && r >= b) h = 60 * ((g - b) / (c * 6));
      else if (g >= b) h = 60 * (2 + (b - r) / (c * 6));
      else h = 60 * (4 + (r - g) / (c * 6));
    }
    if (h < 0) h += 360;

    return `oklch(${l.toFixed(2)} ${c.toFixed(2)} ${Math.round(h)})`;
  }
}
