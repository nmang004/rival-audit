'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Download, ExternalLink } from 'lucide-react';
import { SitemapUrl } from '@/types';
import { toast } from 'sonner';

interface SitemapUrlListProps {
  urls: SitemapUrl[];
}

type SortField = 'loc' | 'lastmod' | 'changefreq' | 'priority';
type SortDirection = 'asc' | 'desc';

export function SitemapUrlList({ urls }: SitemapUrlListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('loc');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Filter URLs based on search query
  const filteredUrls = useMemo(() => {
    if (!searchQuery) return urls;

    const query = searchQuery.toLowerCase();
    return urls.filter((url) =>
      url.loc.toLowerCase().includes(query) ||
      url.changefreq?.toLowerCase().includes(query)
    );
  }, [urls, searchQuery]);

  // Sort URLs
  const sortedUrls = useMemo(() => {
    const sorted = [...filteredUrls];

    sorted.sort((a, b) => {
      let aValue: string | number | undefined;
      let bValue: string | number | undefined;

      switch (sortField) {
        case 'loc':
          aValue = a.loc;
          bValue = b.loc;
          break;
        case 'lastmod':
          aValue = a.lastmod || '';
          bValue = b.lastmod || '';
          break;
        case 'changefreq':
          aValue = a.changefreq || '';
          bValue = b.changefreq || '';
          break;
        case 'priority':
          aValue = a.priority ?? 0;
          bValue = b.priority ?? 0;
          break;
      }

      if (aValue === undefined || aValue === '') return 1;
      if (bValue === undefined || bValue === '') return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return sorted;
  }, [filteredUrls, sortField, sortDirection]);

  // Paginate URLs
  const paginatedUrls = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedUrls.slice(startIndex, endIndex);
  }, [sortedUrls, currentPage]);

  const totalPages = Math.ceil(sortedUrls.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleExportCSV = () => {
    toast.info('CSV export coming soon!');
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4 ml-1 text-primary" />
      : <ArrowDown className="w-4 h-4 ml-1 text-primary" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Sitemap URLs</CardTitle>
            <CardDescription>
              Complete list of all URLs found in the sitemap ({sortedUrls.length} of {urls.length} URLs)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="button-scale"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search URLs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('loc')}
                      className="flex items-center font-semibold text-sm text-gray-700 hover:text-primary transition-colors"
                    >
                      URL
                      <SortIcon field="loc" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('lastmod')}
                      className="flex items-center font-semibold text-sm text-gray-700 hover:text-primary transition-colors"
                    >
                      Last Modified
                      <SortIcon field="lastmod" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('changefreq')}
                      className="flex items-center font-semibold text-sm text-gray-700 hover:text-primary transition-colors"
                    >
                      Change Frequency
                      <SortIcon field="changefreq" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('priority')}
                      className="flex items-center font-semibold text-sm text-gray-700 hover:text-primary transition-colors"
                    >
                      Priority
                      <SortIcon field="priority" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center w-20">
                    <span className="font-semibold text-sm text-gray-700">Link</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedUrls.length > 0 ? (
                  paginatedUrls.map((url, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900 break-all">
                          {url.loc}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {url.lastmod ? new Date(url.lastmod).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600 capitalize">
                          {url.changefreq || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {url.priority !== undefined ? url.priority.toFixed(1) : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <a
                          href={url.loc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center text-primary hover:text-primary/80 transition-colors"
                          title="Open URL in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                      {searchQuery ? 'No URLs match your search' : 'No URLs found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, sortedUrls.length)} of{' '}
              {sortedUrls.length} URLs
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNumber: number;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className="w-10"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
