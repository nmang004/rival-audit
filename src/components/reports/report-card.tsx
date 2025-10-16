'use client';

import { ReportWithAudits } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Share2, Edit, Trash2, Download } from 'lucide-react';
import Link from 'next/link';

interface ReportCardProps {
  report: ReportWithAudits;
  onDelete?: (reportId: string) => void;
}

export function ReportCard({ report, onDelete }: ReportCardProps) {
  const auditCount = report.reportAudits.length;

  return (
    <Card className="card-hover-effect gradient-border">
      <CardHeader className="sage-bg-subtle">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl gradient-text mb-2">{report.name}</CardTitle>
            {report.description && (
              <CardDescription className="line-clamp-2 text-base">
                {report.description}
              </CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/reports/${report.id}`}>
              <Button variant="outline" size="sm" className="button-scale">
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(report.id)}
                className="text-red-600 hover:bg-red-50 button-scale"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1">
            <FileText className="w-4 h-4 text-primary" />
            <span className="font-medium text-primary">{auditCount}</span> {auditCount === 1 ? 'URL' : 'URLs'}
          </span>
          <span>
            Created {new Date(report.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {report.pdfUrl && (
            <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="flex items-center gap-2 button-scale">
                <Download className="w-4 h-4" />
                PDF
              </Button>
            </a>
          )}
          {report.shareableLink && (
            <a
              href={`/reports/share/${report.shareableLink}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="flex items-center gap-2 button-scale">
                <Share2 className="w-4 h-4" />
                Public
              </Button>
            </a>
          )}
          <Link href={`/reports/${report.id}`} className="flex-1">
            <Button variant="default" size="sm" className="w-full button-scale">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
