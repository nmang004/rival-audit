'use client';

import React from 'react';
import Image from 'next/image';

interface BrandPreviewCardProps {
  companyName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export function BrandPreviewCard({
  companyName = 'Your Company',
  logoUrl,
  primaryColor = 'oklch(0.24 0.13 265)', // Navy blue
  secondaryColor = 'oklch(0.71 0.15 60)', // Orange
}: BrandPreviewCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Report Preview
        </h3>
      </div>

      {/* Mock Report Header */}
      <div
        className="rounded-lg p-6 mb-4"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          {logoUrl ? (
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
              <Image
                src={logoUrl}
                alt="Company logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {(companyName || 'YC').charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-white text-lg font-semibold">
              {companyName || 'Your Company'}
            </h2>
            <p className="text-white/80 text-sm">SEO Audit Report</p>
          </div>
        </div>
      </div>

      {/* Mock Report Content */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
          <span className="text-sm text-gray-600">SEO Score</span>
          <div
            className="px-3 py-1 rounded-full text-sm font-semibold"
            style={{ backgroundColor: `${secondaryColor}20`, color: secondaryColor || undefined }}
          >
            85/100
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
          <span className="text-sm text-gray-600">Accessibility</span>
          <div
            className="px-3 py-1 rounded-full text-sm font-semibold"
            style={{ backgroundColor: `${secondaryColor}20`, color: secondaryColor || undefined }}
          >
            92/100
          </div>
        </div>

        <div className="p-3 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: primaryColor || undefined }}
            />
            <span className="text-xs font-medium text-gray-700">
              Key Recommendations
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Sample audit content styled with your brand colors
          </p>
        </div>
      </div>

      {/* Mock Footer */}
      <div
        className="mt-4 pt-3 border-t text-center"
        style={{ borderColor: `${primaryColor}30` }}
      >
        <p className="text-xs" style={{ color: primaryColor || undefined }}>
          Powered by {companyName || 'Your Company'}
        </p>
      </div>
    </div>
  );
}
