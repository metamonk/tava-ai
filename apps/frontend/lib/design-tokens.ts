/**
 * Tava AI Design Tokens
 *
 * A centralized design system configuration that provides type-safe access
 * to all design tokens used throughout the application. These tokens mirror
 * and extend the CSS custom properties defined in globals.css.
 *
 * Usage:
 *   import { colors, spacing, animation } from '@/lib/design-tokens';
 *   <div style={{ color: colors.tava.terracotta }} />
 */

// ═══════════════════════════════════════════════════════════════════════════
// Color Palette
// ═══════════════════════════════════════════════════════════════════════════

export const colors = {
  // Core Tava Palette
  tava: {
    cream: 'var(--tava-cream)',
    warmWhite: 'var(--tava-warm-white)',
    sage: 'var(--tava-sage)',
    sageDeep: 'var(--tava-sage-deep)',
    terracotta: 'var(--tava-terracotta)',
    terracottaDeep: 'var(--tava-terracotta-deep)',
    midnight: 'var(--tava-midnight)',
    slate: 'var(--tava-slate)',
    stone: 'var(--tava-stone)',
    mist: 'var(--tava-mist)',
    // Accent colors
    dawn: 'var(--tava-dawn)',
    dusk: 'var(--tava-dusk)',
    forest: 'var(--tava-forest)',
    gold: 'var(--tava-gold)',
  },
  // Semantic colors
  semantic: {
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    muted: 'var(--muted)',
    accent: 'var(--accent)',
  },
  // Functional colors
  functional: {
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#ef4444',
    info: '#60a5fa',
  },
} as const;

// Raw hex values for use in gradients, rgba, etc.
export const colorValues = {
  cream: '#faf8f5',
  warmWhite: '#fffefb',
  sage: '#a8b5a0',
  sageDeep: '#7d8d74',
  terracotta: '#c4907a',
  terracottaDeep: '#a67462',
  midnight: '#1a1d21',
  slate: '#3d4449',
  stone: '#6b7280',
  mist: '#e8e6e1',
  dawn: '#f4c8a3',
  dusk: '#9ca8c1',
  forest: '#5a6b52',
  gold: '#c9a962',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Spacing Scale
// ═══════════════════════════════════════════════════════════════════════════

export const spacing = {
  xs: 'var(--space-xs)', // 0.25rem - 4px
  sm: 'var(--space-sm)', // 0.5rem - 8px
  md: 'var(--space-md)', // 1rem - 16px
  lg: 'var(--space-lg)', // 2rem - 32px
  xl: 'var(--space-xl)', // 4rem - 64px
  '2xl': 'var(--space-2xl)', // 8rem - 128px
} as const;

export const spacingValues = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '2rem',
  xl: '4rem',
  '2xl': '8rem',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Typography
// ═══════════════════════════════════════════════════════════════════════════

export const typography = {
  fontFamily: {
    display: 'var(--font-display), Georgia, serif',
    body: 'var(--font-body), system-ui, sans-serif',
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem', // 72px
    '8xl': '6rem', // 96px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.05',
    snug: '1.25',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Animation
// ═══════════════════════════════════════════════════════════════════════════

export const animation = {
  easing: {
    outExpo: 'var(--ease-out-expo)',
    inOutSmooth: 'var(--ease-in-out-smooth)',
    // Additional easing functions
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  duration: {
    fast: 'var(--duration-fast)', // 200ms
    normal: 'var(--duration-normal)', // 400ms
    slow: 'var(--duration-slow)', // 800ms
    glacial: 'var(--duration-glacial)', // 1200ms
  },
  durationValues: {
    fast: 200,
    normal: 400,
    slow: 800,
    glacial: 1200,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Border Radius
// ═══════════════════════════════════════════════════════════════════════════

export const radius = {
  none: '0',
  sm: '0.25rem', // 4px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem', // 32px
  full: '9999px',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Shadows
// ═══════════════════════════════════════════════════════════════════════════

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  // Tava-specific shadows
  lift: '0 20px 40px -12px rgba(0, 0, 0, 0.12)',
  glow: {
    terracotta: '0 0 40px rgba(196, 144, 122, 0.3)',
    sage: '0 0 40px rgba(168, 181, 160, 0.3)',
    gold: '0 0 40px rgba(201, 169, 98, 0.3)',
  },
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Gradients
// ═══════════════════════════════════════════════════════════════════════════

export const gradients = {
  // Primary gradients
  terracottaWarm: `linear-gradient(135deg, ${colorValues.terracotta}, ${colorValues.dawn})`,
  terracottaDeep: `linear-gradient(135deg, ${colorValues.terracotta}, ${colorValues.terracottaDeep})`,
  sageNatural: `linear-gradient(135deg, ${colorValues.sage}, ${colorValues.sageDeep})`,
  sageTerracotta: `linear-gradient(135deg, ${colorValues.terracotta}, ${colorValues.sage})`,
  forestSage: `linear-gradient(135deg, ${colorValues.forest}, ${colorValues.sage})`,
  // Accent gradients
  duskMuted: `linear-gradient(135deg, ${colorValues.dusk}, ${colorValues.stone})`,
  goldWarm: `linear-gradient(135deg, ${colorValues.gold}, ${colorValues.terracotta})`,
  midnightSlate: `linear-gradient(135deg, ${colorValues.midnight}, ${colorValues.slate})`,
  // Background gradients (subtle)
  creamSubtle: `linear-gradient(180deg, ${colorValues.warmWhite}, ${colorValues.cream})`,
  mistSubtle: `linear-gradient(180deg, ${colorValues.cream}, ${colorValues.mist}20)`,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Breakpoints
// ═══════════════════════════════════════════════════════════════════════════

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Z-Index Scale
// ═══════════════════════════════════════════════════════════════════════════

export const zIndex = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
  tooltip: 1700,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Component Variants
// ═══════════════════════════════════════════════════════════════════════════

export const componentVariants = {
  button: {
    primary: {
      background: gradients.terracottaDeep,
      text: colorValues.warmWhite,
      hover: gradients.terracottaWarm,
    },
    secondary: {
      background: 'transparent',
      text: colorValues.slate,
      border: colorValues.mist,
      hover: `${colorValues.terracotta}10`,
    },
    ghost: {
      background: 'transparent',
      text: colorValues.stone,
      hover: colorValues.mist,
    },
    sage: {
      background: gradients.sageNatural,
      text: colorValues.warmWhite,
      hover: gradients.forestSage,
    },
  },
  card: {
    default: {
      background: colorValues.warmWhite,
      border: colorValues.mist,
    },
    glass: {
      background: 'rgba(255, 254, 251, 0.7)',
      border: 'rgba(255, 255, 255, 0.3)',
      backdrop: 'blur(20px)',
    },
    elevated: {
      background: colorValues.warmWhite,
      shadow: shadows.lg,
    },
  },
} as const;

// Type exports for TypeScript support
export type TavaColor = keyof typeof colorValues;
export type Spacing = keyof typeof spacing;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type Radius = keyof typeof radius;
export type Shadow = keyof typeof shadows;
export type Gradient = keyof typeof gradients;
export type Breakpoint = keyof typeof breakpoints;
export type ZIndex = keyof typeof zIndex;
