'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarWithName } from '@/components/ui/avatar';

export interface TestimonialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The testimonial quote */
  quote: string;
  /** Author's name */
  name: string;
  /** Author's role or title */
  role?: string;
  /** Author's company or organization */
  company?: string;
  /** Author's avatar image URL */
  avatarSrc?: string;
  /** Rating out of 5 (optional) */
  rating?: number;
  /** Featured/highlighted style */
  featured?: boolean;
}

/**
 * QuoteIcon Component
 *
 * Decorative quote marks for testimonials.
 */
const QuoteIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn('w-10 h-10', className)}
    fill="currentColor"
    viewBox="0 0 32 32"
    aria-hidden="true"
  >
    <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
  </svg>
);

/**
 * StarRating Component
 *
 * Display star ratings for testimonials.
 */
const StarRating = ({ rating, max = 5 }: { rating: number; max?: number }) => (
  <div className="flex gap-0.5" aria-label={`${rating} out of ${max} stars`}>
    {Array.from({ length: max }).map((_, i) => (
      <svg
        key={i}
        className={cn(
          'w-4 h-4',
          i < rating ? 'text-[#c9a962]' : 'text-[#e8e6e1] dark:text-[#2a2f35]'
        )}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

/**
 * TestimonialCard Component
 *
 * A card for displaying customer testimonials with a quote, author info, and optional rating.
 *
 * @example
 * ```tsx
 * <TestimonialCard
 *   quote="Tava has transformed how I document sessions."
 *   name="Dr. Sarah Chen"
 *   role="Clinical Psychologist"
 *   avatarSrc="/avatars/sarah.jpg"
 *   rating={5}
 * />
 * ```
 */
const TestimonialCard = React.forwardRef<HTMLDivElement, TestimonialCardProps>(
  (
    { className, quote, name, role, company, avatarSrc, rating, featured = false, ...props },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        variant={featured ? 'gradient' : 'interactive'}
        padding="lg"
        className={cn(featured && 'md:col-span-2', className)}
        {...props}
      >
        {/* Quote icon */}
        <QuoteIcon className="text-[#c4907a]/20 mb-6" />

        {/* Rating */}
        {rating && (
          <div className="mb-4">
            <StarRating rating={rating} />
          </div>
        )}

        {/* Quote text */}
        <blockquote
          className={cn(
            'text-[#3d4449] dark:text-[#9ca3af] leading-relaxed mb-8',
            featured ? 'text-xl' : 'text-lg'
          )}
        >
          &ldquo;{quote}&rdquo;
        </blockquote>

        {/* Author info */}
        <div className="flex items-center gap-4">
          <Avatar src={avatarSrc} name={name} size={featured ? 'lg' : 'md'} />
          <div>
            <p className="font-semibold text-[#1a1d21] dark:text-[#f5f3ef]">{name}</p>
            {(role || company) && (
              <p className="text-sm text-[#6b7280]">
                {role}
                {role && company && ' at '}
                {company}
              </p>
            )}
          </div>
        </div>
      </Card>
    );
  }
);
TestimonialCard.displayName = 'TestimonialCard';

/**
 * TestimonialCardCompact Component
 *
 * A more compact testimonial for sidebars or smaller spaces.
 */
export type TestimonialCardCompactProps = Omit<TestimonialCardProps, 'featured'>;

const TestimonialCardCompact = React.forwardRef<HTMLDivElement, TestimonialCardCompactProps>(
  ({ className, quote, name, role, avatarSrc, rating, ...props }, ref) => {
    return (
      <Card ref={ref} variant="default" padding="md" className={className} {...props}>
        {rating && (
          <div className="mb-3">
            <StarRating rating={rating} />
          </div>
        )}

        <p className="text-sm text-[#3d4449] dark:text-[#9ca3af] leading-relaxed mb-4">
          &ldquo;{quote}&rdquo;
        </p>

        <AvatarWithName
          src={avatarSrc}
          name={name}
          displayName={name}
          description={role}
          size="sm"
        />
      </Card>
    );
  }
);
TestimonialCardCompact.displayName = 'TestimonialCardCompact';

/**
 * TestimonialBanner Component
 *
 * A horizontal testimonial banner for hero sections or full-width displays.
 */
export interface TestimonialBannerProps extends TestimonialCardProps {
  /** Background variant */
  variant?: 'light' | 'dark' | 'glass';
}

const TestimonialBanner = React.forwardRef<HTMLDivElement, TestimonialBannerProps>(
  (
    { className, quote, name, role, company, avatarSrc, rating, variant = 'glass', ...props },
    ref
  ) => {
    const variantClasses = {
      light: 'bg-white dark:bg-[#161a1d]',
      dark: 'bg-[#1a1d21] text-white',
      glass: 'bg-white/70 dark:bg-[#161a1d]/70 backdrop-blur-xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-3xl p-8 md:p-12',
          'border border-[#e8e6e1] dark:border-[#2a2f35]',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Avatar - larger for banner */}
          <Avatar src={avatarSrc} name={name} size="3xl" className="shrink-0" />

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            {rating && (
              <div className="flex justify-center md:justify-start mb-4">
                <StarRating rating={rating} />
              </div>
            )}

            <blockquote
              className={cn(
                'text-xl md:text-2xl leading-relaxed mb-6',
                variant === 'dark' ? 'text-white/90' : 'text-[#3d4449] dark:text-[#9ca3af]'
              )}
            >
              &ldquo;{quote}&rdquo;
            </blockquote>

            <div>
              <p
                className={cn(
                  'font-semibold text-lg',
                  variant === 'dark' ? 'text-white' : 'text-[#1a1d21] dark:text-[#f5f3ef]'
                )}
              >
                {name}
              </p>
              {(role || company) && (
                <p
                  className={cn('text-sm', variant === 'dark' ? 'text-white/60' : 'text-[#6b7280]')}
                >
                  {role}
                  {role && company && ' at '}
                  {company}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
TestimonialBanner.displayName = 'TestimonialBanner';

export { TestimonialCard, TestimonialCardCompact, TestimonialBanner, QuoteIcon, StarRating };
