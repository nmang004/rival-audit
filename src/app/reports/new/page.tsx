'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditSelector } from '@/components/reports/audit-selector';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Audit } from '@prisma/client';
import { ApiResponse, ReportWithAudits } from '@/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableAuditProps {
  audit: Audit;
  index: number;
}

function SortableAudit({ audit, index }: SortableAuditProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: audit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-white border rounded-lg"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>
      <div className="flex-1">
        <div className="font-medium">{index + 1}. {audit.url}</div>
        {audit.clientName && (
          <div className="text-sm text-gray-600">{audit.clientName}</div>
        )}
      </div>
    </div>
  );
}

export default function NewReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAuditIds, setSelectedAuditIds] = useState<string[]>([]);
  const [orderedAudits, setOrderedAudits] = useState<Audit[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch all audits
  const { data: audits, isLoading } = useQuery<Audit[]>({
    queryKey: ['audits'],
    queryFn: async () => {
      const response = await fetch('/api/audits');
      const result: ApiResponse<Audit[]> = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; auditIds: string[] }) => {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result: ApiResponse<ReportWithAudits> = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      router.push(`/reports/${data?.id}`);
    },
  });

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      alert('Please enter a report name');
      return;
    }
    if (step === 2 && selectedAuditIds.length === 0) {
      alert('Please select at least one audit');
      return;
    }
    if (step === 2) {
      // Move to step 3, prepare ordered audits
      const selected = audits?.filter(a => selectedAuditIds.includes(a.id)) || [];
      setOrderedAudits(selected);
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleCreate = () => {
    const auditIds = orderedAudits.map(a => a.id);
    createReportMutation.mutate({
      name,
      description: description.trim() || undefined,
      auditIds,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedAudits(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Step {step} of 3</span>
          <span className="text-sm text-gray-600">
            {step === 1 && 'Report Details'}
            {step === 2 && 'Select Audits'}
            {step === 3 && 'Arrange Order'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step 1: Report Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Report</CardTitle>
            <CardDescription>
              Enter basic information about your report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Name *
              </label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Q4 2024 Client Analysis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief description of this report"
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNext} className="flex items-center gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Audits */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Audits to Include</CardTitle>
            <CardDescription>
              Choose which audits to include in this report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {audits && audits.length > 0 ? (
              <>
                <AuditSelector
                  audits={audits}
                  selectedAuditIds={selectedAuditIds}
                  onSelectionChange={setSelectedAuditIds}
                />

                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  Selected: {selectedAuditIds.length} audit{selectedAuditIds.length !== 1 ? 's' : ''}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex items-center gap-2">
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No audits available.</p>
                <Button onClick={() => router.push('/dashboard')}>
                  Create an Audit First
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Arrange Order */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Arrange Audit Order</CardTitle>
            <CardDescription>
              Drag and drop to reorder the audits in your report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedAudits.map(a => a.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {orderedAudits.map((audit, index) => (
                    <SortableAudit key={audit.id} audit={audit} index={index} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createReportMutation.isPending}
                className="flex items-center gap-2"
              >
                {createReportMutation.isPending ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Create Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
