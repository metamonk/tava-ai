'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button Variants
 *
 * A comprehensive set of button styles following the Tava design system.
 * Uses class-variance-authority for type-safe variant composition.
 */
const buttonVariants = cva(
  // Base styles applied to all buttons
  [
    'relative inline-flex items-center justify-center gap-2',
    'font-medium transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'overflow-hidden',
  ],
  {
    variants: {
      variant: {
        // Primary - Gradient terracotta, white text
        primary: [
          'text-white',
          'bg-linear-to-r from-[#c4907a] to-[#a67462]',
          'hover:from-[#d4a08a] hover:to-[#b68472]',
          'dark:hover:from-[#d4a08a] dark:hover:to-[#b68472]',
          'focus-visible:ring-[#c4907a]',
          'shadow-md hover:shadow-lg',
          'hover:-translate-y-0.5',
        ],
        // Secondary - Outlined with subtle hover
        secondary: [
          'text-[#3d4449] dark:text-[#9ca3af]',
          'bg-transparent',
          'border border-[#e8e6e1] dark:border-[#2a2f35]',
          'hover:border-[#c4907a]/30 hover:bg-[#c4907a]/5',
          'focus-visible:ring-[#c4907a]',
        ],
        // Ghost - Minimal, text-only with hover state
        ghost: [
          'text-[#6b7280]',
          'hover:text-[#1a1d21] dark:hover:text-[#f5f3ef]',
          'hover:bg-[#e8e6e1]/50 dark:hover:bg-[#2a2f35]/50',
          'focus-visible:ring-[#6b7280]',
        ],
        // Sage - Nature-inspired alternative primary
        sage: [
          'text-white',
          'bg-gradient-to-r from-[#a8b5a0] to-[#7d8d74]',
          'hover:from-[#b8c5b0] hover:to-[#8d9d84]',
          'focus-visible:ring-[#a8b5a0]',
          'shadow-md hover:shadow-lg',
          'hover:-translate-y-0.5',
        ],
        // Dark - Solid dark for high contrast
        dark: [
          'text-white',
          'bg-[#1a1d21] dark:bg-[#f5f3ef] dark:text-[#1a1d21]',
          'hover:opacity-90',
          'focus-visible:ring-[#1a1d21]',
        ],
        // Link - Text link style
        link: [
          'text-[#c4907a]',
          'dark:text-[#d4a08a]',
          'underline-offset-4 hover:underline',
          'focus-visible:ring-[#c4907a]',
        ],
        // Destructive - For dangerous actions
        destructive: [
          'text-white',
          'bg-red-500 dark:bg-red-600',
          'hover:bg-red-600 dark:hover:bg-red-500',
          'focus-visible:ring-red-500',
        ],
        // Glass - Glassmorphism style
        glass: [
          'text-[#1a1d21] dark:text-[#f5f3ef]',
          'bg-white/70 dark:bg-[#161a1d]/70',
          'backdrop-blur-xl',
          'border border-white/30 dark:border-white/10',
          'hover:bg-white/80 dark:hover:bg-[#161a1d]/80',
          'focus-visible:ring-white/50',
        ],
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-lg',
        md: 'h-11 px-6 text-sm rounded-xl',
        lg: 'h-14 px-8 text-base rounded-xl',
        xl: 'h-16 px-10 text-lg rounded-2xl',
        icon: 'h-10 w-10 rounded-xl',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
      rounded: {
        default: '',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      rounded: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Show loading spinner and disable interactions */
  isLoading?: boolean;
  /** Icon to show before button text */
  leftIcon?: React.ReactNode;
  /** Icon to show after button text */
  rightIcon?: React.ReactNode;
  /** Render as a different element (for composition with Link, etc.) */
  asChild?: boolean;
}

/**
 * Button Component
 *
 * A versatile button component with multiple variants, sizes, and states.
 * Supports icons, loading states, and can be composed with other elements.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg">
 *   Get Started
 * </Button>
 *
 * <Button variant="secondary" leftIcon={<ArrowLeft />}>
 *   Go Back
 * </Button>
 *
 * <Button isLoading>
 *   Saving...
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Left icon */}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}

        {/* Button content */}
        <span className={cn(isLoading && 'opacity-0')}>{children}</span>

        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className="shrink-0 transition-transform group-hover:translate-x-0.5">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

/**
 * IconButton Component
 *
 * A convenience wrapper for icon-only buttons with proper accessibility.
 */
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  /** Accessible label for the button (required for icon-only buttons) */
  'aria-label': string;
  /** The icon to display */
  icon: React.ReactNode;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', ...props }, ref) => {
    return (
      <Button ref={ref} size={size} {...props}>
        {icon}
      </Button>
    );
  }
);
IconButton.displayName = 'IconButton';

/**
 * ButtonGroup Component
 *
 * Groups multiple buttons together with connected styling.
 */
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stack buttons vertically on mobile */
  responsive?: boolean;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, responsive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex',
          responsive ? 'flex-col sm:flex-row' : 'flex-row',
          'gap-3',
          className
        )}
        role="group"
        {...props}
      >
        {children}
      </div>
    );
  }
);
ButtonGroup.displayName = 'ButtonGroup';

export { Button, IconButton, ButtonGroup, buttonVariants };
