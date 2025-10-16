'use client';

import { Audit } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './status-badge';
import { ScoreDisplay } from './score-display';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Trash2, Eye, Globe } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface AuditCardProps {
  audit: Audit;
  onDelete: (id: string) => void;
}

export function AuditCard({ audit, onDelete }: AuditCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    onDelete(audit.id);
    setDeleteDialogOpen(false);
  };

  return (
    <Card className="overflow-hidden card-hover-effect subtle-border">
      <CardHeader className="pb-3 sage-bg-subtle">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/audits/${audit.id}`}
              className="text-lg font-semibold text-primary hover:text-secondary transition-colors line-clamp-1 block"
            >
              {audit.url}
            </Link>
            {audit.clientName && (
              <p className="text-sm text-muted-foreground mt-1">
                {audit.clientName}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end">
            <StatusBadge status={audit.status} />
            {audit.isHomepage && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300 animate-badge-pop">
                <Globe className="w-3 h-3 mr-1" />
                Homepage
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Score displays */}
        <div className="grid grid-cols-3 gap-4">
          <ScoreDisplay score={audit.seoScore} label="SEO" size="sm" />
          <ScoreDisplay score={audit.accessibilityScore} label="A11y" size="sm" />
          <ScoreDisplay score={audit.designScore} label="Design" size="sm" />
        </div>

        {/* Metadata */}
        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
          <p>
            Created {formatDistanceToNow(new Date(audit.createdAt), { addSuffix: true })}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-3 bg-muted/30">
        <Button asChild variant="default" size="sm" className="flex-1 button-scale">
          <Link href={`/audits/${audit.id}`}>
            <Eye className="w-4 h-4 mr-1" />
            View
          </Link>
        </Button>

        <Button asChild variant="outline" size="sm" className="button-scale">
          <a href={audit.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Audit</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this audit for {audit.url}?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
