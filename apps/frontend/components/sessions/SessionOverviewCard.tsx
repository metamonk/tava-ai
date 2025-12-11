'use client';

import { Card, Badge, Button } from '@/components/ui';
import type { RiskLevel } from '@/components/disclaimers';

interface SessionOverviewCardProps {
  sessionDate: string;
  riskLevel: RiskLevel;
  planCount: number;
  wordCount: number;
  hasTranscript: boolean;
  onGeneratePlan: () => void;
  isGenerating: boolean;
  className?: string;
}

export default function SessionOverviewCard({
  sessionDate,
  riskLevel,
  planCount,
  wordCount,
  hasTranscript,
  onGeneratePlan,
  isGenerating,
  className = '',
}: SessionOverviewCardProps) {
  const getRiskVariant = (level: RiskLevel): 'error' | 'warning' | 'sage' | 'default' => {
    switch (level) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'sage';
      default:
        return 'default';
    }
  };

  return (
    <Card
      className={`sticky top-0 z-10 backdrop-blur-sm bg-white/95 dark:bg-[#161a1d]/95 ${className}`}
      padding="md"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Metrics Row */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Risk Level */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af]">
              Risk
            </span>
            <Badge variant={getRiskVariant(riskLevel)} size="sm" className="capitalize">
              {riskLevel}
            </Badge>
          </div>

          {/* Plan Count */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#87a28f]/10 dark:bg-[#87a28f]/5">
              <svg
                className="w-4 h-4 text-[#87a28f]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-[#1a1d21] dark:text-[#f5f3ef]">
                {planCount}
              </p>
              <p className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
                {planCount === 1 ? 'Plan' : 'Plans'}
              </p>
            </div>
          </div>

          {/* Word Count */}
          {hasTranscript && (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#9ca8c1]/10 dark:bg-[#9ca8c1]/5">
                <svg
                  className="w-4 h-4 text-[#9ca8c1]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-[#1a1d21] dark:text-[#f5f3ef]">
                  {wordCount.toLocaleString()}
                </p>
                <p className="text-xs text-[#6b7280] dark:text-[#9ca3af]">Words</p>
              </div>
            </div>
          )}

          {/* Session Date */}
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-[#e8e6e1] dark:border-[#2a2f35]">
            <svg
              className="w-4 h-4 text-[#6b7280] dark:text-[#9ca3af]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm text-[#6b7280] dark:text-[#9ca3af]">
              {new Date(sessionDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Primary Action */}
        {hasTranscript && (
          <Button
            variant="sage"
            onClick={onGeneratePlan}
            disabled={isGenerating}
            isLoading={isGenerating}
            loadingText="Generating..."
            className="shrink-0 whitespace-nowrap"
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            }
          >
            Generate Plan
          </Button>
        )}
      </div>
    </Card>
  );
}
