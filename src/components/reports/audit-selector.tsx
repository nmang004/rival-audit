'use client';

import { Audit } from '@prisma/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AuditSelectorProps {
  audits: Audit[];
  selectedAuditIds: string[];
  onSelectionChange: (auditIds: string[]) => void;
}

export function AuditSelector({
  audits,
  selectedAuditIds,
  onSelectionChange,
}: AuditSelectorProps) {
  const handleToggle = (auditId: string) => {
    const newSelection = selectedAuditIds.includes(auditId)
      ? selectedAuditIds.filter(id => id !== auditId)
      : [...selectedAuditIds, auditId];
    onSelectionChange(newSelection);
  };

  const getScoreBadgeColor = (score: number | null) => {
    if (score === null) return 'bg-gray-500';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-3">
      {audits.map(audit => {
        const isSelected = selectedAuditIds.includes(audit.id);

        return (
          <Card
            key={audit.id}
            className={`cursor-pointer transition-all ${
              isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleToggle(audit.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleToggle(audit.id)}
                  onClick={e => e.stopPropagation()}
                />

                <div className="flex-1">
                  <p className="font-medium text-gray-900">{audit.url}</p>
                  {audit.clientName && (
                    <p className="text-sm text-gray-600">{audit.clientName}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  {audit.seoScore !== null && (
                    <div className="text-center">
                      <Badge className={`${getScoreBadgeColor(audit.seoScore)} text-white`}>
                        {audit.seoScore}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">SEO</p>
                    </div>
                  )}
                  {audit.accessibilityScore !== null && (
                    <div className="text-center">
                      <Badge className={`${getScoreBadgeColor(audit.accessibilityScore)} text-white`}>
                        {audit.accessibilityScore}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">A11y</p>
                    </div>
                  )}
                  {audit.designScore !== null && (
                    <div className="text-center">
                      <Badge className={`${getScoreBadgeColor(audit.designScore * 10)} text-white`}>
                        {audit.designScore}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">Design</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
