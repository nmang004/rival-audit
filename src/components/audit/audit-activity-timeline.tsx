'use client';

import { Audit } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Plus,
  Edit,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: 'created' | 'status_changed' | 'exported' | 'shared';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
  iconColor: string;
}

interface AuditActivityTimelineProps {
  audit: Audit;
}

export function AuditActivityTimeline({ audit }: AuditActivityTimelineProps) {
  // Generate activity events based on audit data
  const events: ActivityEvent[] = [];

  // Created event (always present)
  events.push({
    id: '1',
    type: 'created',
    title: 'Audit Created',
    description: `Audit created${audit.clientName ? ` for ${audit.clientName}` : ''}`,
    timestamp: new Date(audit.createdAt),
    icon: <Plus className="w-4 h-4" />,
    iconColor: 'bg-blue-500',
  });

  // Status completed event (if completed)
  if (audit.status === 'COMPLETED' && audit.updatedAt > audit.createdAt) {
    events.push({
      id: '2',
      type: 'status_changed',
      title: 'Status Changed',
      description: `Status updated to ${audit.status}`,
      timestamp: new Date(audit.updatedAt),
      icon: <CheckCircle2 className="w-4 h-4" />,
      iconColor: 'bg-green-500',
    });
  }

  // Status in progress event (if in progress)
  if (audit.status === 'IN_PROGRESS') {
    events.push({
      id: '3',
      type: 'status_changed',
      title: 'Status Changed',
      description: 'Audit started and in progress',
      timestamp: new Date(audit.updatedAt),
      icon: <Clock className="w-4 h-4" />,
      iconColor: 'bg-yellow-500',
    });
  }

  // Status signed event (if signed)
  if (audit.status === 'SIGNED') {
    events.push({
      id: '4',
      type: 'status_changed',
      title: 'Project Signed',
      description: 'Client signed the project',
      timestamp: new Date(audit.updatedAt),
      icon: <Edit className="w-4 h-4" />,
      iconColor: 'bg-purple-500',
    });
  }

  // Sort events by timestamp (newest first)
  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <Card className="card-hover-effect">
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>History of events for this audit</CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No activity recorded yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gray-200" />

            {/* Events */}
            <div className="space-y-6">
              {events.map((event) => (
                <div key={event.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${event.iconColor} text-white shadow-md shrink-0`}>
                    {event.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(event.timestamp, 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User info */}
        {audit.clientName && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>Client: <strong>{audit.clientName}</strong></span>
              {audit.clientEmail && (
                <span className="text-gray-400">({audit.clientEmail})</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
