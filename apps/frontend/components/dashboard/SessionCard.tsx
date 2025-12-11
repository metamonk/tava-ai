'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, Badge, StatusBadge } from '@/components/ui';

type SessionStatus = 'completed' | 'processing' | 'scheduled' | 'cancelled';

interface Session {
  id: string;
  clientId?: string;
  clientName?: string;
  date: string;
  status: SessionStatus;
  hasTranscript?: boolean;
  hasPlan?: boolean;
  riskLevel?: 'none' | 'low' | 'medium' | 'high';
}

interface SessionCardProps {
  session: Session;
  onClick?: () => void;
  showClient?: boolean;
  className?: string;
}

export function SessionCard({ session, onClick, showClient, className }: SessionCardProps) {
  const statusConfig: Record<
    SessionStatus,
    { label: string; type: 'completed' | 'pending' | 'active' | 'error' }
  > = {
    completed: { label: 'Completed', type: 'completed' },
    processing: { label: 'Processing', type: 'pending' },
    scheduled: { label: 'Scheduled', type: 'active' },
    cancelled: { label: 'Cancelled', type: 'error' },
  };

  const { label, type } = statusConfig[session.status];

  return (
    <Card
      variant="interactive"
      padding="lg"
      className={cn('cursor-pointer', className)}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {showClient && session.clientName && (
            <p className="text-sm font-medium text-[#c4907a] dark:text-[#d4a08a]">
              {session.clientName}
            </p>
          )}
          <p className="text-lg font-semibold text-[#1a1d21] dark:text-[#f5f3ef]">
            {formatDate(session.date)}
          </p>
          <div className="flex items-center gap-2">
            <StatusBadge status={type}>{label}</StatusBadge>
            {session.riskLevel && session.riskLevel !== 'none' && (
              <RiskBadge level={session.riskLevel} />
            )}
            {session.hasPlan && (
              <Badge variant="sage" size="sm">
                Plan Created
              </Badge>
            )}
          </div>
        </div>
        <svg
          className="w-5 h-5 text-[#6b7280] dark:text-[#9ca3af]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Card>
  );
}

// Risk badge sub-component
interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high';
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const config = {
    low: { label: 'Low Risk', variant: 'warning' as const },
    medium: { label: 'Medium Risk', variant: 'warning' as const },
    high: { label: 'High Risk', variant: 'error' as const },
  };

  return (
    <Badge variant={config[level].variant} size="sm">
      {config[level].label}
    </Badge>
  );
}

// Utility function
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
