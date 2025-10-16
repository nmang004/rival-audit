'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const auditFormSchema = z.object({
  url: z.string().url('Please enter a valid URL (e.g., https://example.com)'),
  clientName: z.string().optional(),
  clientEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
});

export type AuditFormData = z.infer<typeof auditFormSchema>;

interface AuditFormProps {
  onSubmit: (data: AuditFormData) => void;
  isLoading?: boolean;
}

export function AuditForm({ onSubmit, isLoading = false }: AuditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuditFormData>({
    resolver: zodResolver(auditFormSchema),
  });

  const handleFormSubmit = (data: AuditFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">
          Website URL <span className="text-red-500">*</span>
        </Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com"
          {...register('url')}
          disabled={isLoading}
          className={errors.url ? 'border-red-500' : ''}
        />
        {errors.url && (
          <p className="text-sm text-red-500">{errors.url.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientName">Client Name (Optional)</Label>
          <Input
            id="clientName"
            type="text"
            placeholder="Acme Corporation"
            {...register('clientName')}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientEmail">Client Email (Optional)</Label>
          <Input
            id="clientEmail"
            type="email"
            placeholder="contact@example.com"
            {...register('clientEmail')}
            disabled={isLoading}
            className={errors.clientEmail ? 'border-red-500' : ''}
          />
          {errors.clientEmail && (
            <p className="text-sm text-red-500">{errors.clientEmail.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isLoading} className="w-full rival-button">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Audit...
          </>
        ) : (
          'Create Audit'
        )}
      </Button>
    </form>
  );
}
