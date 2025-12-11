'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/section';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonGroup } from '@/components/ui/button';

export interface HeroProps extends React.HTMLAttributes<HTMLElement> {
  /** Eyebrow badge text */
  eyebrow?: string;
  /** Main headline */
  title: string;
  /** Title with highlighted word(s) - replaces simple title */
  titleHighlight?: {
    before: string;
    highlighted: string;
    after?: string;
  };
  /** Subtitle/description text */
  subtitle?: string;
  /** Primary CTA */
  primaryAction?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  /** Secondary CTA */
  secondaryAction?: {
    label: string;
    href: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  /** Trust indicators (logos, text, etc.) */
  trustIndicators?: React.ReactNode;
  /** Background variant */
  variant?: 'default' | 'centered' | 'split';
  /** Show animated background orbs */
  showOrbs?: boolean;
}

/**
 * AnimatedBackground Component
 *
 * Decorative gradient orbs for hero backgrounds.
 */
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Primary gradient orb */}
    <div
      className="absolute -top-[40%] -right-[20%] w-[80vw] h-[80vw] rounded-full animate-drift"
      style={{
        background:
          'radial-gradient(circle at 30% 30%, rgba(196, 144, 122, 0.15), rgba(168, 181, 160, 0.1) 50%, transparent 70%)',
      }}
    />
    {/* Secondary gradient orb */}
    <div
      className="absolute -bottom-[30%] -left-[20%] w-[70vw] h-[70vw] rounded-full animate-drift"
      style={{
        background:
          'radial-gradient(circle at 70% 70%, rgba(168, 181, 160, 0.12), rgba(156, 168, 193, 0.08) 50%, transparent 70%)',
        animationDelay: '-10s',
      }}
    />
    {/* Accent orb */}
    <div
      className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] rounded-full animate-breathe"
      style={{
        background: 'radial-gradient(circle, rgba(244, 200, 163, 0.1), transparent 60%)',
      }}
    />
  </div>
);

/**
 * HighlightedTitle Component
 *
 * Title with gradient-highlighted word and decorative underline.
 */
const HighlightedTitle = ({
  before,
  highlighted,
  after,
  className,
}: {
  before: string;
  highlighted: string;
  after?: string;
  className?: string;
}) => (
  <h1 className={className}>
    {before}{' '}
    <span className="relative inline-block">
      <span className="relative z-10 bg-linear-to-r from-[#c4907a] to-[#a8b5a0] bg-clip-text text-transparent">
        {highlighted}
      </span>
      <svg
        className="absolute -bottom-2 left-0 w-full h-3 text-[#c4907a]/30"
        viewBox="0 0 200 12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 8.5C50 2 150 2 198 8.5"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </span>
    {after && ` ${after}`}
  </h1>
);

/**
 * Hero Component
 *
 * A versatile hero section for landing pages with animated backgrounds,
 * highlighted titles, and call-to-action buttons.
 *
 * @example
 * ```tsx
 * <Hero
 *   eyebrow="Trusted by 500+ professionals"
 *   titleHighlight={{
 *     before: "Transform therapy sessions into",
 *     highlighted: "healing pathways",
 *   }}
 *   subtitle="AI-powered treatment planning for mental health professionals."
 *   primaryAction={{ label: "Start Free Trial", href: "/signup" }}
 *   secondaryAction={{ label: "Watch Demo", href: "#demo" }}
 *   showOrbs
 * />
 * ```
 */
const Hero = React.forwardRef<HTMLElement, HeroProps>(
  (
    {
      className,
      eyebrow,
      title,
      titleHighlight,
      subtitle,
      primaryAction,
      secondaryAction,
      trustIndicators,
      variant = 'centered',
      showOrbs = true,
      ...props
    },
    ref
  ) => {
    const headlineClasses = cn(
      'font-display font-semibold tracking-tight text-[#1a1d21] dark:text-[#f5f3ef] leading-[1.05] text-balance',
      'text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl'
    );

    return (
      <section
        ref={ref}
        className={cn(
          'relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6',
          className
        )}
        {...props}
      >
        {/* Animated background */}
        {showOrbs && <AnimatedBackground />}

        <Container size="md" className="relative z-10">
          <div className={cn(variant === 'centered' && 'text-center')}>
            {/* Eyebrow badge */}
            {eyebrow && (
              <div className="animate-reveal-up mb-8">
                <Badge variant="sage" size="lg" rounded="full" dot>
                  {eyebrow}
                </Badge>
              </div>
            )}

            {/* Main headline */}
            {titleHighlight ? (
              <HighlightedTitle
                before={titleHighlight.before}
                highlighted={titleHighlight.highlighted}
                after={titleHighlight.after}
                className={cn(headlineClasses, 'animate-reveal-up delay-100 mb-8')}
              />
            ) : (
              <h1 className={cn(headlineClasses, 'animate-reveal-up delay-100 mb-8')}>{title}</h1>
            )}

            {/* Subtitle */}
            {subtitle && (
              <p
                className={cn(
                  'animate-reveal-up delay-200',
                  'text-lg sm:text-xl text-[#6b7280] dark:text-[#9ca3af] leading-relaxed text-balance mb-12',
                  variant === 'centered' && 'max-w-2xl mx-auto'
                )}
              >
                {subtitle}
              </p>
            )}

            {/* CTA Buttons */}
            {(primaryAction || secondaryAction) && (
              <div className="animate-reveal-up delay-300">
                <ButtonGroup responsive className={variant === 'centered' ? 'justify-center' : ''}>
                  {primaryAction && (
                    <Button
                      variant="primary"
                      size="lg"
                      rounded="full"
                      className="group hover-glow"
                      onClick={primaryAction.onClick}
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
                      variant="secondary"
                      size="lg"
                      rounded="full"
                      className="group"
                      onClick={secondaryAction.onClick}
                      leftIcon={secondaryAction.icon}
                      asChild
                    >
                      <a href={secondaryAction.href}>{secondaryAction.label}</a>
                    </Button>
                  )}
                </ButtonGroup>
              </div>
            )}

            {/* Trust indicators */}
            {trustIndicators && (
              <div className="animate-reveal-up delay-400 mt-16 pt-12 border-t border-[#e8e6e1] dark:border-[#2a2f35]">
                {trustIndicators}
              </div>
            )}
          </div>
        </Container>
      </section>
    );
  }
);
Hero.displayName = 'Hero';

/**
 * TrustLogos Component
 *
 * Pre-built trust indicators section for logos.
 */
export interface TrustLogosProps {
  /** Label text above logos */
  label?: string;
  /** Array of company names or logo elements */
  logos: (string | React.ReactNode)[];
}

const TrustLogos = ({ label = 'Trusted by leading practices', logos }: TrustLogosProps) => (
  <>
    <p className="text-xs font-medium uppercase tracking-wider text-[#6b7280] mb-6">{label}</p>
    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
      {logos.map((logo, index) => (
        <span
          key={index}
          className="font-display text-xl font-semibold text-[#3d4449] dark:text-[#9ca3af]"
        >
          {logo}
        </span>
      ))}
    </div>
  </>
);

export { Hero, AnimatedBackground, HighlightedTitle, TrustLogos };
