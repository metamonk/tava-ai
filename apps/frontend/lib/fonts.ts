/**
 * Font Configuration for Tava AI
 *
 * This module provides a centralized, type-safe font configuration using Next.js
 * built-in font optimization. Fonts are self-hosted at build time, eliminating
 * external network requests and improving privacy and performance.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/fonts
 */

import { Cormorant_Garamond, DM_Sans } from 'next/font/google';

/**
 * Display Font - Cormorant Garamond
 *
 * An elegant serif typeface for headlines, hero text, and display purposes.
 * Provides a premium, distinctive feel appropriate for a healthcare platform.
 *
 * Usage: Apply via `fonts.display.className` or CSS variable `--font-display`
 */
export const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
});

/**
 * Body Font - DM Sans
 *
 * A clean, modern sans-serif typeface for body text, UI elements, and general
 * readability. Excellent legibility at all sizes.
 *
 * Usage: Apply via `fonts.body.className` or CSS variable `--font-body`
 */
export const bodyFont = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-body',
});

/**
 * Combined font configuration object for easy access
 */
export const fonts = {
  display: displayFont,
  body: bodyFont,
} as const;

/**
 * CSS class string combining all font CSS variables
 * Apply this to the root element (html or body) to make all font variables available
 */
export const fontVariables = `${displayFont.variable} ${bodyFont.variable}`;

/**
 * Font CSS variable names for use in CSS/Tailwind
 */
export const fontCSSVariables = {
  display: '--font-display',
  body: '--font-body',
} as const;

/**
 * Type definitions for font configuration
 */
export type FontKey = keyof typeof fonts;
export type FontCSSVariable = (typeof fontCSSVariables)[FontKey];
