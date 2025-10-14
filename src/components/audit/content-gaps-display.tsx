'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ContentGap } from '@/types';

interface ContentGapsDisplayProps {
  gaps: ContentGap[];
}

export function ContentGapsDisplay({ gaps }: ContentGapsDisplayProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      case 'low':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Content Gaps & Missing Pages</CardTitle>
        <CardDescription>
          AI-identified opportunities to improve your website&apos;s content coverage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {gaps.map((gap, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{gap.category}</h4>
                <p className="text-sm text-gray-600">{gap.description}</p>
              </div>
              <Badge className={getPriorityColor(gap.priority)}>
                <span className="flex items-center gap-1">
                  {getPriorityIcon(gap.priority)}
                  {gap.priority.toUpperCase()}
                </span>
              </Badge>
            </div>

            {gap.suggestedPages.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Suggested Pages:</p>
                <div className="flex flex-wrap gap-2">
                  {gap.suggestedPages.map((page, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {page}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500 italic">
              {gap.reasoning}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
