'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { UrlStructureIssue } from '@/types';

interface UrlStructureIssuesDisplayProps {
  issues: UrlStructureIssue[];
}

export function UrlStructureIssuesDisplay({ issues }: UrlStructureIssuesDisplayProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getTypeLabel = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>URL Structure Issues</CardTitle>
        <CardDescription>
          Problems detected in your website&apos;s URL organization and naming
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {issues.map((issue, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {getTypeLabel(issue.type)}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                  <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                    <strong>Recommendation:</strong> {issue.recommendation}
                  </p>
                </div>
              </div>
              <Badge className={getSeverityColor(issue.severity)}>
                {issue.severity.toUpperCase()}
              </Badge>
            </div>

            {issue.affectedUrls.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Affected URLs ({issue.affectedUrls.length}):
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {issue.affectedUrls.slice(0, 5).map((url, idx) => (
                    <code key={idx} className="block text-xs bg-gray-50 p-2 rounded">
                      {url}
                    </code>
                  ))}
                  {issue.affectedUrls.length > 5 && (
                    <p className="text-xs text-gray-500 italic">
                      ... and {issue.affectedUrls.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
