'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

const DefaultIcon = () => (
  <svg
    className="h-16 w-16 text-gray-400 dark:text-[#6b7280]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">{icon || <DefaultIcon />}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#f5f3ef] mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-[#9ca3af] mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

// Pre-built empty states for common scenarios

interface NoClientsEmptyProps {
  onAddClient?: () => void;
  message?: string;
}

export function NoClientsEmpty({ onAddClient, message }: NoClientsEmptyProps) {
  return (
    <EmptyState
      icon={
        <svg
          className="h-16 w-16 text-[#6b7280] dark:text-[#6b7280]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      }
      title="No clients yet"
      description={
        message || 'Start by adding your first client to create sessions and treatment plans.'
      }
      action={
        onAddClient && (
          <button
            onClick={onAddClient}
            className="inline-flex items-center px-4 py-2 bg-[#c4907a] text-white rounded-lg hover:bg-[#a67462] dark:bg-[#c4907a] dark:hover:bg-[#d4a08a] transition-colors"
          >
            Add Client
          </button>
        )
      }
    />
  );
}

interface NoSessionsEmptyProps {
  onAction?: () => void;
  actionLabel?: string;
  message?: string;
}

export function NoSessionsEmpty({
  onAction,
  actionLabel = 'Create Session',
  message,
}: NoSessionsEmptyProps) {
  return (
    <EmptyState
      icon={
        <svg
          className="h-16 w-16 text-[#6b7280] dark:text-[#6b7280]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      }
      title="No sessions yet"
      description={
        message ||
        'Create a new session to start recording therapy notes and generating treatment plans.'
      }
      action={
        onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 bg-[#c4907a] text-white rounded-lg hover:bg-[#a67462] dark:bg-[#c4907a] dark:hover:bg-[#d4a08a] transition-colors"
          >
            {actionLabel}
          </button>
        )
      }
    />
  );
}

interface NoPlansEmptyProps {
  message?: string;
}

export function NoPlansEmpty({ message }: NoPlansEmptyProps = {}) {
  return (
    <EmptyState
      icon={
        <svg
          className="h-16 w-16 text-[#6b7280] dark:text-[#6b7280]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      }
      title="No treatment plans yet"
      description={
        message ||
        'Upload a transcript or audio recording to generate an AI-powered treatment plan.'
      }
    />
  );
}

export function NoPlanHistoryEmpty() {
  return (
    <EmptyState
      icon={
        <svg
          className="h-16 w-16 text-gray-400 dark:text-[#6b7280]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
      title="No version history"
      description="Plan versions will appear here as you make edits to the treatment plan."
    />
  );
}

export function SearchResultsEmpty({ query }: { query: string }) {
  return (
    <EmptyState
      icon={
        <svg
          className="h-16 w-16 text-gray-400 dark:text-[#6b7280]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title="No results found"
      description={`We couldn't find any results for "${query}". Try adjusting your search terms.`}
    />
  );
}
