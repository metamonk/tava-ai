'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, type CardProps } from '@/components/ui/card';

/**
 * Gradient presets for feature cards
 */
export const featureGradients = {
  terracotta: 'from-[#c4907a] to-[#f4c8a3]',
  terracottaDeep: 'from-[#c4907a] to-[#a67462]',
  sage: 'from-[#a8b5a0] to-[#7d8d74]',
  forest: 'from-[#5a6b52] to-[#a8b5a0]',
  dusk: 'from-[#9ca8c1] to-[#6b7280]',
  gold: 'from-[#c9a962] to-[#c4907a]',
  midnight: 'from-[#3d4449] to-[#6b7280]',
} as const;

export type FeatureGradient = keyof typeof featureGradients;

export interface FeatureCardProps extends Omit<CardProps, 'children'> {
  /** Icon element to display */
  icon: React.ReactNode;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Gradient color for the icon background */
  gradient?: FeatureGradient;
  /** Optional action element (button, link, etc.) */
  action?: React.ReactNode;
}

/**
 * FeatureCard Component
 *
 * A card designed for displaying features with an icon, title, and description.
 * Matches the Tava Health aesthetic with gradient icon backgrounds.
 *
 * @example
 * ```tsx
 * <FeatureCard
 *   icon={<Mic className="w-7 h-7" />}
 *   title="Session Transcription"
 *   description="Upload audio recordings and receive precise transcripts."
 *   gradient="terracotta"
 * />
 * ```
 */
const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  (
    {
      className,
      icon,
      title,
      description,
      gradient = 'terracotta',
      action,
      variant = 'interactive',
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        variant={variant}
        padding="lg"
        className={cn('group relative overflow-hidden', className)}
        {...props}
      >
        {/* Subtle gradient overlay on hover */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500',
            featureGradients[gradient]
          )}
        />

        {/* Icon with gradient background */}
        <div
          className={cn(
            'relative w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6',
            'bg-gradient-to-br',
            featureGradients[gradient]
          )}
        >
          {icon}
        </div>

        {/* Content */}
        <h3 className="relative font-display text-xl sm:text-2xl font-semibold text-[#1a1d21] dark:text-[#f5f3ef] mb-3">
          {title}
        </h3>
        <p className="relative text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">{description}</p>

        {/* Optional action */}
        {action && <div className="relative mt-6">{action}</div>}
      </Card>
    );
  }
);
FeatureCard.displayName = 'FeatureCard';

/**
 * FeatureCardCompact Component
 *
 * A smaller variant of the feature card for denser layouts.
 */
export type FeatureCardCompactProps = Omit<FeatureCardProps, 'action'>;

const FeatureCardCompact = React.forwardRef<HTMLDivElement, FeatureCardCompactProps>(
  ({ className, icon, title, description, gradient = 'terracotta', ...props }, ref) => {
    return (
      <Card ref={ref} variant="default" padding="md" className={cn('group', className)} {...props}>
        <div className="flex gap-4">
          {/* Icon */}
          <div
            className={cn(
              'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white',
              'bg-gradient-to-br',
              featureGradients[gradient]
            )}
          >
            {icon}
          </div>

          {/* Content */}
          <div>
            <h4 className="font-semibold text-[#1a1d21] dark:text-[#f5f3ef] mb-1">{title}</h4>
            <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </Card>
    );
  }
);
FeatureCardCompact.displayName = 'FeatureCardCompact';

/**
 * FeatureCardHorizontal Component
 *
 * A horizontal layout feature card for wider content areas.
 */
export interface FeatureCardHorizontalProps extends FeatureCardProps {
  /** Position of the icon/visual */
  iconPosition?: 'left' | 'right';
}

const FeatureCardHorizontal = React.forwardRef<HTMLDivElement, FeatureCardHorizontalProps>(
  (
    {
      className,
      icon,
      title,
      description,
      gradient = 'terracotta',
      action,
      iconPosition = 'left',
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        variant="interactive"
        padding="lg"
        className={cn('group', className)}
        {...props}
      >
        <div
          className={cn(
            'flex flex-col md:flex-row gap-6 md:gap-8 items-start',
            iconPosition === 'right' && 'md:flex-row-reverse'
          )}
        >
          {/* Icon */}
          <div
            className={cn(
              'shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-white',
              'bg-gradient-to-br',
              featureGradients[gradient]
            )}
          >
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-display text-2xl font-semibold text-[#1a1d21] dark:text-[#f5f3ef] mb-2">
              {title}
            </h3>
            <p className="text-[#6b7280] dark:text-[#9ca3af] leading-relaxed mb-4">{description}</p>
            {action}
          </div>
        </div>
      </Card>
    );
  }
);
FeatureCardHorizontal.displayName = 'FeatureCardHorizontal';

export { FeatureCard, FeatureCardCompact, FeatureCardHorizontal };
