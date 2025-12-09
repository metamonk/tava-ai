import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with conflict resolution
 * Uses clsx for conditional classes and tailwind-merge to handle conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Type-safe variant helper for component styling
 * Creates a function that maps variant keys to class strings
 */
export function createVariants<T extends Record<string, string>>(variants: T) {
  return (variant: keyof T) => variants[variant];
}

/**
 * Generates staggered animation delay classes
 * @param index - The index of the element in a list
 * @param baseDelay - Base delay in milliseconds (default: 100)
 * @returns CSS custom property style object
 */
export function staggerDelay(index: number, baseDelay = 100) {
  return { animationDelay: `${index * baseDelay}ms` };
}

/**
 * Format a number as a percentage string
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}
