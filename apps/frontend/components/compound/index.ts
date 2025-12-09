/**
 * Tava AI - Compound Components
 *
 * Higher-level components composed from UI primitives.
 * These components implement common patterns and layouts.
 */

// Feature Card components
export {
  FeatureCard,
  FeatureCardCompact,
  FeatureCardHorizontal,
  featureGradients,
  type FeatureCardProps,
  type FeatureCardCompactProps,
  type FeatureCardHorizontalProps,
  type FeatureGradient,
} from './FeatureCard';

// Testimonial components
export {
  TestimonialCard,
  TestimonialCardCompact,
  TestimonialBanner,
  QuoteIcon,
  StarRating,
  type TestimonialCardProps,
  type TestimonialCardCompactProps,
  type TestimonialBannerProps,
} from './TestimonialCard';

// Hero components
export {
  Hero,
  AnimatedBackground,
  HighlightedTitle,
  TrustLogos,
  type HeroProps,
  type TrustLogosProps,
} from './Hero';

// Step/Process components
export {
  StepCard,
  StepVisual,
  ProcessSteps,
  type StepCardProps,
  type StepVisualProps,
  type ProcessStepsProps,
} from './StepCard';

// CTA components
export { CTASection, CTABanner, type CTASectionProps, type CTABannerProps } from './CTASection';
