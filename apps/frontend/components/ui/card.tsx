'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Card Variants
 *
 * Multiple card styles to suit different contexts within the Tava design system.
 */
const cardVariants = cva(
  // Base styles
  ['rounded-3xl transition-all duration-300'],
  {
    variants: {
      variant: {
        // Default - Clean white card with subtle border
        default: ['bg-white dark:bg-[#161a1d]', 'border border-[#e8e6e1] dark:border-[#2a2f35]'],
        // Elevated - Card with shadow for emphasis
        elevated: ['bg-white dark:bg-[#161a1d]', 'shadow-lg'],
        // Glass - Glassmorphism effect
        glass: [
          'bg-white/70 dark:bg-[#161a1d]/70',
          'backdrop-blur-xl',
          'border border-white/30 dark:border-white/10',
        ],
        // Outlined - Just a border, transparent background
        outlined: ['bg-transparent', 'border border-[#e8e6e1] dark:border-[#2a2f35]'],
        // Filled - Subtle background color
        filled: ['bg-[#faf8f5] dark:bg-[#1a1d21]'],
        // Interactive - Card that responds to hover
        interactive: [
          'bg-white dark:bg-[#161a1d]',
          'border border-[#e8e6e1] dark:border-[#2a2f35]',
          'cursor-pointer',
          'hover:-translate-y-1 hover:shadow-xl',
          'hover:border-[#c4907a]/30 dark:hover:border-[#c4907a]/40',
        ],
        // Gradient - Card with gradient border
        gradient: [
          'bg-white dark:bg-[#161a1d]',
          'p-[1px]',
          'bg-gradient-to-br from-[#c4907a] via-[#a8b5a0] to-[#9ca8c1]',
        ],
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  /** Render as a different element */
  as?: 'div' | 'article' | 'section';
}

/**
 * Card Component
 *
 * A flexible container component that can be used for various content types.
 * Supports multiple visual variants and composable child components.
 *
 * @example
 * ```tsx
 * <Card variant="interactive">
 *   <CardHeader>
 *     <CardTitle>Treatment Plan</CardTitle>
 *     <CardDescription>Generated from session #42</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Plan content here...</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>View Details</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, as: Component = 'div', children, ...props }, ref) => {
    // Special handling for gradient variant - needs inner container
    if (variant === 'gradient') {
      return (
        <Component
          ref={ref}
          className={cn(cardVariants({ variant, padding: 'none', className }))}
          {...props}
        >
          <div
            className={cn(
              'rounded-[calc(1.5rem-1px)] bg-white dark:bg-[#161a1d]',
              padding === 'none'
                ? ''
                : padding === 'sm'
                  ? 'p-4'
                  : padding === 'lg'
                    ? 'p-8'
                    : padding === 'xl'
                      ? 'p-10'
                      : 'p-6'
            )}
          >
            {children}
          </div>
        </Component>
      );
    }

    return (
      <Component ref={ref} className={cn(cardVariants({ variant, padding, className }))} {...props}>
        {children}
      </Component>
    );
  }
);
Card.displayName = 'Card';

/**
 * CardHeader Component
 *
 * Container for card title and description.
 */
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

/**
 * CardTitle Component
 *
 * The main heading for a card.
 */
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }
>(({ className, as: Component = 'h3', ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      'font-display text-2xl font-semibold tracking-tight',
      'text-[#1a1d21] dark:text-[#f5f3ef]',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

/**
 * CardDescription Component
 *
 * Secondary text that provides additional context.
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-[#6b7280] dark:text-[#9ca3af]', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

/**
 * CardContent Component
 *
 * The main content area of a card.
 */
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('pt-4', className)} {...props} />
);
CardContent.displayName = 'CardContent';

/**
 * CardFooter Component
 *
 * Container for card actions and supplementary content.
 */
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-6', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

/**
 * CardImage Component
 *
 * An image that spans the card width (typically at the top).
 */
export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Aspect ratio for the image container */
  aspectRatio?: 'auto' | 'square' | 'video' | 'wide';
}

const CardImage = React.forwardRef<HTMLImageElement, CardImageProps>(
  ({ className, aspectRatio = 'video', alt = '', ...props }, ref) => {
    const aspectClasses = {
      auto: '',
      square: 'aspect-square',
      video: 'aspect-video',
      wide: 'aspect-[21/9]',
    };

    return (
      <div className={cn('overflow-hidden rounded-t-3xl -m-6 mb-0', aspectClasses[aspectRatio])}>
        <img
          ref={ref}
          alt={alt}
          className={cn('w-full h-full object-cover', className)}
          {...props}
        />
      </div>
    );
  }
);
CardImage.displayName = 'CardImage';

/**
 * CardBadge Component
 *
 * A badge/tag that floats in the corner of a card.
 */
const CardBadge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  }
>(({ className, position = 'top-right', ...props }, ref) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <span
      ref={ref}
      className={cn(
        'absolute z-10',
        positionClasses[position],
        'px-3 py-1 rounded-full',
        'text-xs font-medium',
        'bg-white/90 dark:bg-[#161a1d]/90',
        'backdrop-blur-sm',
        'border border-[#e8e6e1]/50 dark:border-[#2a2f35]/50',
        className
      )}
      {...props}
    />
  );
});
CardBadge.displayName = 'CardBadge';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
  CardBadge,
  cardVariants,
};
