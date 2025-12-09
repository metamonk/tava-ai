'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonGroup } from '@/components/ui/button';

export interface CTASectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Main headline */
  title: string;
  /** Supporting description */
  description?: string;
  /** Primary CTA button */
  primaryAction?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  /** Secondary CTA button/link */
  secondaryAction?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  /** Visual variant */
  variant?: 'default' | 'contained' | 'gradient';
  /** Show decorative orbs */
  showOrbs?: boolean;
}

/**
 * CTASection Component
 *
 * A call-to-action section for encouraging user conversion.
 *
 * @example
 * ```tsx
 * <CTASection
 *   title="Ready to transform your practice?"
 *   description="Join hundreds of mental health professionals who are saving time."
 *   primaryAction={{ label: "Start Free Trial", href: "/signup" }}
 *   secondaryAction={{ label: "Sign in", href: "/login" }}
 *   variant="contained"
 * />
 * ```
 */
const CTASection = React.forwardRef<HTMLElement, CTASectionProps>(
  (
    {
      className,
      title,
      description,
      primaryAction,
      secondaryAction,
      variant = 'contained',
      showOrbs = true,
      ...props
    },
    ref
  ) => {
    // Default variant - full width with light background
    if (variant === 'default') {
      return (
        <section ref={ref} className={cn('relative py-24 sm:py-32 px-6', className)} {...props}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#1a1d21] dark:text-[#f5f3ef] mb-6">
              {title}
            </h2>
            {description && (
              <p className="text-lg text-[#6b7280] mb-10 max-w-xl mx-auto">{description}</p>
            )}
            <ButtonGroup responsive className="justify-center">
              {primaryAction && (
                <Button variant="primary" size="lg" rounded="full" className="group" asChild>
                  <a href={primaryAction.href}>
                    {primaryAction.label}
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </a>
                </Button>
              )}
              {secondaryAction && (
                <Button variant="ghost" size="lg" asChild>
                  <a href={secondaryAction.href}>{secondaryAction.label}</a>
                </Button>
              )}
            </ButtonGroup>
          </div>
        </section>
      );
    }

    // Contained variant - dark card with orbs
    return (
      <section ref={ref} className={cn('relative py-24 sm:py-32 px-6', className)} {...props}>
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-[2.5rem] overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1d21] via-[#2a2f35] to-[#1a1d21]" />

            {/* Decorative orbs */}
            {showOrbs && (
              <>
                <div
                  className="absolute -top-20 -right-20 w-80 h-80 rounded-full animate-drift"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(196, 144, 122, 0.3), transparent 60%)',
                  }}
                />
                <div
                  className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full animate-drift"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(168, 181, 160, 0.2), transparent 60%)',
                    animationDelay: '-5s',
                  }}
                />
              </>
            )}

            {/* Content */}
            <div className="relative z-10 text-center py-16 sm:py-20 px-8">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6">
                {title}
              </h2>
              {description && (
                <p className="text-lg text-[#9ca3af] max-w-xl mx-auto mb-10">{description}</p>
              )}
              <ButtonGroup responsive className="justify-center">
                {primaryAction && (
                  <Button
                    variant="dark"
                    size="lg"
                    rounded="full"
                    className="group bg-white text-[#1a1d21] hover:bg-[#f5f3ef]"
                    asChild
                  >
                    <a href={primaryAction.href}>
                      {primaryAction.label}
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </a>
                  </Button>
                )}
                {secondaryAction && (
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-white/80 hover:text-white hover:bg-white/10"
                    asChild
                  >
                    <a href={secondaryAction.href}>{secondaryAction.label}</a>
                  </Button>
                )}
              </ButtonGroup>
            </div>
          </div>
        </div>
      </section>
    );
  }
);
CTASection.displayName = 'CTASection';

/**
 * CTABanner Component
 *
 * A smaller inline CTA banner for use within content sections.
 */
export interface CTABannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Banner text */
  text: string;
  /** CTA button label */
  actionLabel: string;
  /** CTA button href */
  actionHref: string;
  /** Visual variant */
  variant?: 'default' | 'sage' | 'terracotta';
}

const CTABanner = React.forwardRef<HTMLDivElement, CTABannerProps>(
  ({ className, text, actionLabel, actionHref, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-[#faf8f5] dark:bg-[#1a1d21] border-[#e8e6e1] dark:border-[#2a2f35]',
      sage: 'bg-[#a8b5a0]/10 border-[#a8b5a0]/20',
      terracotta: 'bg-[#c4907a]/10 border-[#c4907a]/20',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border p-6 sm:p-8',
          'flex flex-col sm:flex-row items-center justify-between gap-4',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <p className="text-[#1a1d21] dark:text-[#f5f3ef] font-medium text-center sm:text-left">
          {text}
        </p>
        <Button
          variant={variant === 'default' ? 'primary' : variant === 'sage' ? 'sage' : 'primary'}
          size="md"
          rounded="full"
          className="shrink-0"
          asChild
        >
          <a href={actionHref}>{actionLabel}</a>
        </Button>
      </div>
    );
  }
);
CTABanner.displayName = 'CTABanner';

export { CTASection, CTABanner };
