'use client';

import { useState, useEffect } from 'react';
import { AuditStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Filter, X, Save, FolderOpen } from 'lucide-react';

export interface FilterValues {
  dateFrom?: string;
  dateTo?: string;
  statuses: AuditStatus[];
  seoScoreMin: number;
  seoScoreMax: number;
  a11yScoreMin: number;
  a11yScoreMax: number;
  designScoreMin: number;
  designScoreMax: number;
  clientName?: string;
  homepageOnly: boolean;
  sitemapOnly: boolean;
}

interface FilterPreset {
  name: string;
  filters: FilterValues;
}

interface AdvancedFiltersProps {
  onApply: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
}

const DEFAULT_FILTERS: FilterValues = {
  statuses: [],
  seoScoreMin: 0,
  seoScoreMax: 100,
  a11yScoreMin: 0,
  a11yScoreMax: 100,
  designScoreMin: 0,
  designScoreMax: 100,
  homepageOnly: false,
  sitemapOnly: false,
};

const STATUS_OPTIONS: { value: AuditStatus; label: string }[] = [
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'INITIAL_CALL', label: 'Initial Call' },
  { value: 'SIGNED', label: 'Signed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

const STORAGE_KEY = 'audit-filter-presets';

export function AdvancedFilters({ onApply, initialFilters }: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(initialFilters || DEFAULT_FILTERS);
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  // Load presets from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPresets(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load filter presets', e);
      }
    }
  }, []);

  const handleStatusToggle = (status: AuditStatus) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const handleApply = () => {
    onApply(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS);
    onApply(DEFAULT_FILTERS);
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;

    const newPreset: FilterPreset = {
      name: presetName.trim(),
      filters,
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPresets));
    setPresetName('');
    setShowSavePreset(false);
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
  };

  const handleDeletePreset = (index: number) => {
    const updatedPresets = presets.filter((_, i) => i !== index);
    setPresets(updatedPresets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPresets));
  };

  const activeFilterCount =
    filters.statuses.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    (filters.clientName ? 1 : 0) +
    (filters.homepageOnly ? 1 : 0) +
    (filters.sitemapOnly ? 1 : 0) +
    (filters.seoScoreMin > 0 || filters.seoScoreMax < 100 ? 1 : 0) +
    (filters.a11yScoreMin > 0 || filters.a11yScoreMax < 100 ? 1 : 0) +
    (filters.designScoreMin > 0 || filters.designScoreMax < 10 ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <Filter className="w-4 h-4" />
          Advanced Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Refine your audit search with detailed filters
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Date Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date-from" className="text-sm text-gray-600">From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="date-to" className="text-sm text-gray-600">To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Status Multi-Select */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Status</Label>
            <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
              {STATUS_OPTIONS.map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${value}`}
                    checked={filters.statuses.includes(value)}
                    onCheckedChange={() => handleStatusToggle(value)}
                  />
                  <label
                    htmlFor={`status-${value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Score Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              SEO Score: {filters.seoScoreMin} - {filters.seoScoreMax}
            </Label>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[filters.seoScoreMin, filters.seoScoreMax]}
              onValueChange={([min, max]) => setFilters(prev => ({
                ...prev,
                seoScoreMin: min,
                seoScoreMax: max
              }))}
              className="mt-2"
            />
          </div>

          {/* Accessibility Score Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Accessibility Score: {filters.a11yScoreMin} - {filters.a11yScoreMax}
            </Label>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[filters.a11yScoreMin, filters.a11yScoreMax]}
              onValueChange={([min, max]) => setFilters(prev => ({
                ...prev,
                a11yScoreMin: min,
                a11yScoreMax: max
              }))}
              className="mt-2"
            />
          </div>

          {/* Design Score Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Design Score: {filters.designScoreMin} - {filters.designScoreMax}
            </Label>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[filters.designScoreMin, filters.designScoreMax]}
              onValueChange={([min, max]) => setFilters(prev => ({
                ...prev,
                designScoreMin: min,
                designScoreMax: max
              }))}
              className="mt-2"
            />
          </div>

          {/* Client Name */}
          <div className="space-y-3">
            <Label htmlFor="client-name" className="text-base font-semibold">Client Name</Label>
            <Input
              id="client-name"
              type="text"
              placeholder="Filter by client name..."
              value={filters.clientName || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, clientName: e.target.value }))}
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Audit Type</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="homepage-only"
                  checked={filters.homepageOnly}
                  onCheckedChange={(checked) => setFilters(prev => ({
                    ...prev,
                    homepageOnly: checked as boolean
                  }))}
                />
                <label
                  htmlFor="homepage-only"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Homepage audits only
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sitemap-only"
                  checked={filters.sitemapOnly}
                  onCheckedChange={(checked) => setFilters(prev => ({
                    ...prev,
                    sitemapOnly: checked as boolean
                  }))}
                />
                <label
                  htmlFor="sitemap-only"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Sitemap audits only
                </label>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="space-y-3 pt-6 border-t">
            <Label className="text-base font-semibold">Filter Presets</Label>

            {/* Save Preset */}
            {!showSavePreset ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSavePreset(true)}
                className="w-full gap-2"
              >
                <Save className="w-4 h-4" />
                Save Current Filters as Preset
              </Button>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Preset name..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                />
                <Button size="sm" onClick={handleSavePreset}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowSavePreset(false);
                    setPresetName('');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Load Presets */}
            {presets.length > 0 && (
              <div className="space-y-2">
                {presets.map((preset, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadPreset(preset)}
                      className="flex-1 justify-start gap-2"
                    >
                      <FolderOpen className="w-4 h-4" />
                      {preset.name}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeletePreset(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={handleClear} className="flex-1">
            Clear All
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
