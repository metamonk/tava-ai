'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface StepCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Step number (01, 02, etc.) */
  step: string;
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Visual content (illustration, icon, etc.) */
  visual?: React.ReactNode;
  /** Whether this is the last step (no connector line) */
  isLast?: boolean;
  /** Text alignment */
  align?: 'left' | 'center';
}

/**
 * StepCard Component
 *
 * A card for displaying process steps with visual, number, title, and description.
 * Used in "How it Works" sections.
 *
 * @example
 * ```tsx
 * <StepCard
 *   step="01"
 *   title="Upload Session"
 *   description="Record your therapy session or upload an existing audio file."
 *   visual={<UploadVisual />}
 * />
 * ```
 */
const StepCard = React.forwardRef<HTMLDivElement, StepCardProps>(
  (
    { className, step, title, description, visual, isLast = false, align = 'center', ...props },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {/* Connector line (hidden on last step and mobile) */}
        {!isLast && (
          <div className="hidden lg:block absolute top-1/4 -right-2 w-4 h-px bg-gradient-to-r from-[#3d4449] to-transparent" />
        )}

        <div className={cn(align === 'center' ? 'text-center' : 'text-left', 'lg:text-left')}>
          {/* Visual */}
          {visual && <div className="mb-8">{visual}</div>}

          {/* Step number */}
          <span className="inline-block font-display text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c4907a] to-[#a8b5a0] mb-4">
            {step}
          </span>

          {/* Title */}
          <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#1a1d21] dark:text-white mb-3">
            {title}
          </h3>

          {/* Description */}
          <p className="text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">{description}</p>
        </div>
      </div>
    );
  }
);
StepCard.displayName = 'StepCard';

/**
 * StepVisual Component
 *
 * A container for step visuals with consistent styling.
 */
export interface StepVisualProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Aspect ratio */
  aspectRatio?: 'auto' | 'square' | 'video' | '4/3';
}

const StepVisual = React.forwardRef<HTMLDivElement, StepVisualProps>(
  ({ className, aspectRatio = '4/3', children, ...props }, ref) => {
    const aspectClasses = {
      auto: '',
      square: 'aspect-square',
      video: 'aspect-video',
      '4/3': 'aspect-[4/3]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full rounded-2xl overflow-hidden',
          'bg-gradient-to-br from-[#2a2f35] to-[#1a1d21]',
          aspectClasses[aspectRatio],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
StepVisual.displayName = 'StepVisual';

/**
 * ProcessSteps Component
 *
 * A container for multiple StepCards in a process flow.
 */
export interface ProcessStepsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of step data */
  steps: Array<{
    step: string;
    title: string;
    description: string;
    visual?: React.ReactNode;
  }>;
}

const ProcessSteps = React.forwardRef<HTMLDivElement, ProcessStepsProps>(
  ({ className, steps, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('grid lg:grid-cols-3 gap-8 lg:gap-4', className)} {...props}>
        {steps.map((step, index) => (
          <StepCard
            key={step.step}
            step={step.step}
            title={step.title}
            description={step.description}
            visual={step.visual}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    );
  }
);
ProcessSteps.displayName = 'ProcessSteps';

export { StepCard, StepVisual, ProcessSteps };
