'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TopPage } from '@/types';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopPagesTableProps {
  pages: TopPage[];
  domain?: string;
}

export function TopPagesTable({ pages }: TopPagesTableProps) {
  // Handle empty data
  if (!pages || pages.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>No top pages data available</p>
      </div>
    );
  }

  // Format large numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Format position to 1 decimal place
  const formatPosition = (pos: number): string => {
    return pos.toFixed(1);
  };

  // Truncate long URLs for display
  const truncateUrl = (url: string, maxLength: number = 50): string => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-full">
      {/* Desktop view - full table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Page URL</TableHead>
              <TableHead className="text-right">Organic Traffic</TableHead>
              <TableHead className="text-right">Keywords</TableHead>
              <TableHead className="text-right">Avg Position</TableHead>
              <TableHead className="text-center w-[80px]">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <span className="text-sm text-gray-900" title={page.url}>
                    {truncateUrl(page.url)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-semibold text-green-600">
                    {formatNumber(page.traffic)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm font-semibold text-blue-600">
                    {formatNumber(page.keywords)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm text-gray-700">
                    {formatPosition(page.position)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Button asChild variant="ghost" size="sm">
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view - card layout */}
      <div className="md:hidden space-y-4">
        {pages.map((page, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 break-all">
                  {page.url}
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Traffic</p>
                <p className="text-sm font-semibold text-green-600">
                  {formatNumber(page.traffic)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Keywords</p>
                <p className="text-sm font-semibold text-blue-600">
                  {formatNumber(page.keywords)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Position</p>
                <p className="text-sm font-semibold text-gray-700">
                  {formatPosition(page.position)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
