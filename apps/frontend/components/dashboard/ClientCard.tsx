'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, Avatar } from '@/components/ui';
import { RiskBadge } from './SessionCard';

interface Client {
  id: string;
  name: string;
  email: string;
  lastSession?: string;
  nextSession?: string;
  riskLevel?: 'none' | 'low' | 'medium' | 'high';
  sessionCount?: number;
}

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
  className?: string;
}

export function ClientCard({ client, onClick, className }: ClientCardProps) {
  return (
    <Card
      variant="interactive"
      padding="lg"
      className={cn('cursor-pointer', className)}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <Avatar name={client.name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-[#1a1d21] dark:text-[#f5f3ef] truncate">
              {client.name}
            </h3>
            {client.riskLevel && client.riskLevel !== 'none' && (
              <RiskBadge level={client.riskLevel} />
            )}
          </div>
          <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] truncate">{client.email}</p>
          {client.lastSession && (
            <p className="mt-2 text-xs text-[#6b7280] dark:text-[#9ca3af]">
              Last session: {formatDate(client.lastSession)}
            </p>
          )}
        </div>
        <svg
          className="w-5 h-5 text-[#6b7280] dark:text-[#9ca3af] flex-shrink-0"
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
