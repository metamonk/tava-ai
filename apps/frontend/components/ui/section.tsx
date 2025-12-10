'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Section Variants
 *
 * Page section layouts following the Tava design system.
 */
const sectionVariants = cva(
  // Base styles
  ['relative'],
  {
    variants: {
      variant: {
        // Default - Light background
        default: 'bg-[#faf8f5] dark:bg-[#0f1114]',
        // White - Pure white/dark
        white: 'bg-white dark:bg-[#161a1d]',
        // Dark - Inverted section
        dark: 'bg-[#1a1d21] dark:bg-[#0a0c0e] text-white',
        // Gradient - Subtle gradient background
        gradient: [
          'bg-gradient-to-b',
          'from-[#faf8f5] to-white',
          'dark:from-[#0f1114] dark:to-[#161a1d]',
        ],
        // Transparent - No background
        transparent: 'bg-transparent',
      },
      spacing: {
        none: 'py-0',
        sm: 'py-12 sm:py-16',
        md: 'py-16 sm:py-24',
        lg: 'py-24 sm:py-32',
        xl: 'py-32 sm:py-40',
      },
    },
    defaultVariants: {
      variant: 'default',
      spacing: 'lg',
    },
  }
);

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof sectionVariants> {
  /** Section ID for anchor navigation */
  id?: string;
}

/**
 * Section Component
 *
 * A full-width section container for page layout.
 *
 * @example
 * ```tsx
 * <Section variant="dark" spacing="lg" id="features">
 *   <Container>
 *     <SectionHeader
 *       eyebrow="Features"
 *       title="Everything you need"
 *       description="Powerful tools for mental health professionals."
 *     />
 *     <Grid cols={3}>...</Grid>
 *   </Container>
 * </Section>
 * ```
 */
const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, variant, spacing, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(sectionVariants({ variant, spacing, className }))}
        {...props}
      >
        {children}
      </section>
    );
  }
);
Section.displayName = 'Section';

/**
 * Container Component
 *
 * Constrains content width and adds horizontal padding.
 */
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum width size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const containerSizes = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[90rem]',
  full: 'max-w-full',
};

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mx-auto px-4 sm:px-6', containerSizes[size], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Container.displayName = 'Container';

/**
 * SectionHeader Component
 *
 * Standardized section header with eyebrow, title, and description.
 */
export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Small text above the title */
  eyebrow?: string;
  /** Main section title */
  title: string;
  /** Description text below the title */
  description?: string;
  /** Text alignment */
  align?: 'left' | 'center';
  /** Eyebrow color variant */
  eyebrowVariant?: 'terracotta' | 'sage' | 'default';
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    {
      className,
      eyebrow,
      title,
      description,
      align = 'center',
      eyebrowVariant = 'terracotta',
      ...props
    },
    ref
  ) => {
    const eyebrowColors = {
      terracotta: 'text-[#c4907a]',
      sage: 'text-[#7d8d74]',
      default: 'text-[#6b7280]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          align === 'center' ? 'text-center' : 'text-left',
          'mb-12 sm:mb-16 lg:mb-20',
          className
        )}
        {...props}
      >
        {eyebrow && (
          <span
            className={cn(
              'inline-block text-sm font-semibold uppercase tracking-wider mb-4',
              eyebrowColors[eyebrowVariant]
            )}
          >
            {eyebrow}
          </span>
        )}
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-[#1a1d21] dark:text-[#f5f3ef] mb-4 sm:mb-6 text-balance">
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              'text-base sm:text-lg text-[#6b7280] dark:text-[#9ca3af] leading-relaxed text-balance',
              align === 'center' && 'max-w-2xl mx-auto'
            )}
          >
            {description}
          </p>
        )}
      </div>
    );
  }
);
SectionHeader.displayName = 'SectionHeader';

/**
 * Grid Component
 *
 * Responsive grid layout for content.
 */
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns on larger screens */
  cols?: 1 | 2 | 3 | 4 | 6;
  /** Gap between items */
  gap?: 'sm' | 'md' | 'lg';
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 3, gap = 'md', children, ...props }, ref) => {
    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    };

    const gapClasses = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    };

    return (
      <div
        ref={ref}
        className={cn('grid', colClasses[cols], gapClasses[gap], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Grid.displayName = 'Grid';

/**
 * Stack Component
 *
 * Vertical or horizontal stack with consistent spacing.
 */
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stack direction */
  direction?: 'vertical' | 'horizontal';
  /** Gap size */
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Alignment */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Justify content */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      direction = 'vertical',
      gap = 'md',
      align = 'stretch',
      justify = 'start',
      children,
      ...props
    },
    ref
  ) => {
    const gapClasses = {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    };

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          direction === 'vertical' ? 'flex-col' : 'flex-row',
          gapClasses[gap],
          alignClasses[align],
          justifyClasses[justify],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Stack.displayName = 'Stack';

/**
 * Divider Component
 *
 * Visual separator between content sections.
 */
export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Decorative variant */
  variant?: 'solid' | 'dashed' | 'gradient';
}

const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ className, orientation = 'horizontal', variant = 'solid', ...props }, ref) => {
    const baseClasses = orientation === 'horizontal' ? 'w-full h-px' : 'h-full w-px';

    const variantClasses = {
      solid: 'bg-[#e8e6e1] dark:bg-[#2a2f35]',
      dashed:
        'bg-[#e8e6e1] dark:bg-[#2a2f35] [mask-image:repeating-linear-gradient(90deg,transparent,transparent_4px,black_4px,black_8px)]',
      gradient: 'bg-linear-to-r from-transparent via-[#e8e6e1] dark:via-[#2a2f35] to-transparent',
    };

    return (
      <hr ref={ref} className={cn(baseClasses, variantClasses[variant], className)} {...props} />
    );
  }
);
Divider.displayName = 'Divider';

export { Section, Container, SectionHeader, Grid, Stack, Divider, sectionVariants };
