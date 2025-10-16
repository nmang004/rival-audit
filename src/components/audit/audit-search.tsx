'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Audit } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AuditSearchProps {
  audits: Audit[];
  value: string;
  onChange: (value: string) => void;
  onSelectAudit?: (audit: Audit) => void;
}

const SEARCH_HISTORY_KEY = 'audit-search-history';
const MAX_HISTORY_ITEMS = 5;

export function AuditSearch({ audits, value, onChange, onSelectAudit }: AuditSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (stored) {
      try {
        setSearchHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load search history', e);
      }
    }
  }, []);

  // Save to search history when user selects or submits
  const saveToHistory = (query: string) => {
    if (!query.trim()) return;

    const newHistory = [
      query,
      ...searchHistory.filter(item => item !== query)
    ].slice(0, MAX_HISTORY_ITEMS);

    setSearchHistory(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  };

  // Filter audits based on search query
  const matchingAudits = useMemo(() => {
    if (!value.trim()) return [];

    const query = value.toLowerCase();
    return audits
      .filter(audit =>
        audit.url.toLowerCase().includes(query) ||
        (audit.clientName?.toLowerCase().includes(query) ?? false)
      )
      .slice(0, 5); // Limit to 5 results
  }, [audits, value]);

  // Show dropdown when focused and has content
  const showDropdown = isFocused && (value.trim() || searchHistory.length > 0);
  const hasResults = matchingAudits.length > 0;
  const showHistory = !value.trim() && searchHistory.length > 0;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    const itemCount = hasResults ? matchingAudits.length : searchHistory.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < itemCount - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (hasResults) {
            const audit = matchingAudits[selectedIndex];
            handleSelectAudit(audit);
          } else if (showHistory) {
            const historyItem = searchHistory[selectedIndex];
            onChange(historyItem);
            setIsFocused(false);
          }
        } else if (value.trim()) {
          saveToHistory(value);
          setIsFocused(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectAudit = (audit: Audit) => {
    saveToHistory(value);
    onChange('');
    setIsFocused(false);
    onSelectAudit?.(audit);
  };

  const handleSelectHistory = (query: string) => {
    onChange(query);
    // Don't close dropdown - let user see the results
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange('');
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected index when value changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [value]);

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search by URL or client name..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg overflow-hidden z-50 animate-fadeIn"
        >
          {/* Matching Audits */}
          {hasResults && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Matching Audits
              </div>
              {matchingAudits.map((audit, index) => (
                <button
                  key={audit.id}
                  onClick={() => handleSelectAudit(audit)}
                  className={cn(
                    'w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors',
                    selectedIndex === index && 'bg-primary/10'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {audit.url}
                      </div>
                      {audit.clientName && (
                        <div className="text-xs text-gray-500 truncate">
                          {audit.clientName}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(audit.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Search History */}
          {showHistory && (
            <div className="py-2">
              <div className="flex items-center justify-between px-3 py-1">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recent Searches
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  className="h-6 text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </Button>
              </div>
              {searchHistory.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectHistory(query)}
                  className={cn(
                    'w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2',
                    selectedIndex === index && 'bg-primary/10'
                  )}
                >
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{query}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!hasResults && value.trim() && (
            <div className="px-3 py-6 text-center text-sm text-gray-500">
              No audits found matching &quot;{value}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
