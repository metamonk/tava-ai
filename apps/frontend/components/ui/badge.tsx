'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Badge Variants
 *
 * Badges for status indicators, tags, and labels following Tava design.
 */
const badgeVariants = cva(
  // Base styles
  ['inline-flex items-center justify-center', 'font-medium whitespace-nowrap', 'transition-colors'],
  {
    variants: {
      variant: {
        // Default - Subtle background
        default: ['bg-[#e8e6e1] dark:bg-[#2a2f35]', 'text-[#3d4449] dark:text-[#9ca3af]'],
        // Primary - Terracotta theme
        primary: ['bg-[#c4907a]/10 dark:bg-[#c4907a]/20', 'text-[#a67462] dark:text-[#d4a08a]'],
        // Sage - Nature theme
        sage: ['bg-[#a8b5a0]/10 dark:bg-[#a8b5a0]/20', 'text-[#5a6b52] dark:text-[#b8c5b0]'],
        // Success - Positive states
        success: ['bg-green-100 dark:bg-green-900/30', 'text-green-700 dark:text-green-400'],
        // Warning - Caution states
        warning: ['bg-amber-100 dark:bg-amber-900/30', 'text-amber-700 dark:text-amber-400'],
        // Error - Negative states
        error: ['bg-red-100 dark:bg-red-900/30', 'text-red-700 dark:text-red-400'],
        // Info - Informational
        info: ['bg-blue-100 dark:bg-blue-900/30', 'text-blue-700 dark:text-blue-400'],
        // Outlined - Border only
        outlined: [
          'bg-transparent',
          'border border-[#e8e6e1] dark:border-[#2a2f35]',
          'text-[#3d4449] dark:text-[#9ca3af]',
        ],
        // Gold - Premium/highlighted
        gold: ['bg-[#c9a962]/10 dark:bg-[#c9a962]/20', 'text-[#a08742] dark:text-[#d9b972]'],
        // Dusk - Muted accent
        dusk: ['bg-[#9ca8c1]/10 dark:bg-[#9ca8c1]/20', 'text-[#6b7a91] dark:text-[#acb8d1]'],
      },
      size: {
        sm: 'h-5 px-2 text-xs rounded-md gap-1',
        md: 'h-6 px-2.5 text-xs rounded-lg gap-1.5',
        lg: 'h-7 px-3 text-sm rounded-lg gap-2',
      },
      rounded: {
        default: '',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** Icon to show before text */
  icon?: React.ReactNode;
  /** Show a dot indicator */
  dot?: boolean;
  /** Dot color (defaults to current text color) */
  dotColor?: string;
  /** Make badge removable with an X button */
  onRemove?: () => void;
}

/**
 * Badge Component
 *
 * A versatile badge for displaying status, tags, or labels.
 *
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="primary" dot>New</Badge>
 * <Badge variant="outlined" onRemove={() => {}}>Removable</Badge>
 * ```
 */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, variant, size, rounded, icon, dot, dotColor, onRemove, children, ...props },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, rounded, className }))}
        {...props}
      >
        {/* Dot indicator */}
        {dot && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"
            style={dotColor ? { backgroundColor: dotColor } : undefined}
          />
        )}

        {/* Icon */}
        {icon && <span className="shrink-0">{icon}</span>}

        {/* Content */}
        {children}

        {/* Remove button */}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-0.5 -mr-1 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Remove"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

/**
 * StatusBadge Component
 *
 * Pre-configured badge for common status patterns.
 */
export type StatusType = 'active' | 'inactive' | 'pending' | 'completed' | 'error' | 'draft';

const statusConfig: Record<StatusType, { variant: BadgeProps['variant']; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  inactive: { variant: 'default', label: 'Inactive' },
  pending: { variant: 'warning', label: 'Pending' },
  completed: { variant: 'sage', label: 'Completed' },
  error: { variant: 'error', label: 'Error' },
  draft: { variant: 'dusk', label: 'Draft' },
};

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: StatusType;
  /** Custom label to override default */
  label?: string;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, label, ...props }, ref) => {
    const config = statusConfig[status];
    return (
      <Badge ref={ref} variant={config.variant} dot {...props}>
        {label || config.label}
      </Badge>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

/**
 * BadgeGroup Component
 *
 * Container for multiple badges with consistent spacing.
 */
const BadgeGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-wrap gap-2', className)} {...props} />
  )
);
BadgeGroup.displayName = 'BadgeGroup';

export { Badge, StatusBadge, BadgeGroup, badgeVariants };
