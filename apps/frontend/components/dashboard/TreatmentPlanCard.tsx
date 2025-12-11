'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Type for parsed treatment plan
interface TreatmentPlan {
  progressSummary?: string;
  goals?: string[];
  interventions?: string[];
  strengths?: string[];
}

interface TreatmentPlanCardProps {
  plan: TreatmentPlan;
  className?: string;
}

export function TreatmentPlanCard({ plan, className }: TreatmentPlanCardProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Summary */}
      {plan.progressSummary && (
        <PlanSection title="Progress Summary" icon="chart" variant="gradient-blue">
          <p className="text-[#1a1d21] dark:text-[#f5f3ef]">{plan.progressSummary}</p>
        </PlanSection>
      )}

      {/* Goals */}
      {plan.goals && plan.goals.length > 0 && (
        <PlanSection title="Goals" icon="target" variant="default">
          <ul className="space-y-2">
            {plan.goals.map((goal, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-green-500 dark:text-green-400 mt-0.5">✓</span>
                <span className="text-[#1a1d21] dark:text-[#d1d5db]">{goal}</span>
              </li>
            ))}
          </ul>
        </PlanSection>
      )}

      {/* Interventions / Things to Try */}
      {plan.interventions && plan.interventions.length > 0 && (
        <PlanSection title="Things to Try" icon="lightbulb" variant="default">
          <ul className="space-y-2">
            {plan.interventions.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#c4907a] dark:text-[#d4a08a] mt-0.5">→</span>
                <span className="text-[#1a1d21] dark:text-[#d1d5db]">{item}</span>
              </li>
            ))}
          </ul>
        </PlanSection>
      )}

      {/* Strengths */}
      {plan.strengths && plan.strengths.length > 0 && (
        <PlanSection title="Your Strengths" icon="star" variant="gradient-purple">
          <ul className="space-y-2">
            {plan.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#a8b5a0] dark:text-[#b8c5b0] mt-0.5">★</span>
                <span className="text-[#1a1d21] dark:text-[#d1d5db]">{strength}</span>
              </li>
            ))}
          </ul>
        </PlanSection>
      )}
    </div>
  );
}

// Internal section component
interface PlanSectionProps {
  title: string;
  icon: 'chart' | 'target' | 'lightbulb' | 'star';
  variant: 'default' | 'gradient-blue' | 'gradient-purple';
  children: React.ReactNode;
}

function PlanSection({ title, icon, variant, children }: PlanSectionProps) {
  const variantStyles = {
    default: 'bg-white dark:bg-[#161a1d] border border-[#e8e6e1] dark:border-[#2a2f35]',
    'gradient-blue':
      'bg-gradient-to-r from-[#c4907a]/10 to-[#a8b5a0]/10 dark:from-[#c4907a]/5 dark:to-[#a8b5a0]/5 border border-[#c4907a]/20 dark:border-[#c4907a]/10',
    'gradient-purple':
      'bg-gradient-to-r from-[#a8b5a0]/10 to-[#9ca8c1]/10 dark:from-[#a8b5a0]/5 dark:to-[#9ca8c1]/5 border border-[#a8b5a0]/20 dark:border-[#a8b5a0]/10',
  };

  const icons = {
    chart: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    target: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    lightbulb: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    star: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
  };

  return (
    <div className={cn('rounded-xl p-6', variantStyles[variant])}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[#c4907a] dark:text-[#d4a08a]">{icons[icon]}</span>
        <h3 className="text-lg font-semibold text-[#1a1d21] dark:text-[#f5f3ef]">{title}</h3>
      </div>
      {children}
    </div>
  );
}
