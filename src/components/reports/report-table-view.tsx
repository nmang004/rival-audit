'use client';

import { ReportWithAudits } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Eye, Download, Share2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ReportTableViewProps {
  reports: ReportWithAudits[];
  onDelete: (reportId: string) => void;
}

export function ReportTableView({ reports, onDelete }: ReportTableViewProps) {
  const handleCopyShareLink = (shareableLink: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${shareableLink}`);
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
      <table className="w-full">
        <thead className="bg-primary text-primary-foreground">
          <tr>
            <th className="text-left p-4 font-semibold">Report Name</th>
            <th className="text-left p-4 font-semibold">Description</th>
            <th className="text-left p-4 font-semibold"># Audits</th>
            <th className="text-left p-4 font-semibold">Created</th>
            <th className="text-left p-4 font-semibold">Status</th>
            <th className="text-left p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id} className="border-b hover:bg-muted/50 transition-colors">
              <td className="p-4">
                <Link
                  href={`/reports/${report.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {report.name}
                </Link>
              </td>
              <td className="p-4 text-gray-600">
                {report.description
                  ? report.description.substring(0, 100) + (report.description.length > 100 ? '...' : '')
                  : '-'}
              </td>
              <td className="p-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {report.reportAudits.length}
                </span>
              </td>
              <td className="p-4 text-sm text-gray-600">
                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
              </td>
              <td className="p-4">
                {report.pdfUrl ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Generated
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    Draft
                  </span>
                )}
              </td>
              <td className="p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/reports/${report.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Report
                      </Link>
                    </DropdownMenuItem>
                    {report.pdfUrl && (
                      <DropdownMenuItem asChild>
                        <a href={report.pdfUrl} download>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </a>
                      </DropdownMenuItem>
                    )}
                    {report.shareableLink && (
                      <DropdownMenuItem onClick={() => handleCopyShareLink(report.shareableLink!)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Copy Share Link
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete(report.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
