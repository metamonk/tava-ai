'use client';

import { useState } from 'react';

interface ErrorBannerProps {
  message: string;
  details?: string;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export default function ErrorBanner({
  message,
  details,
  onDismiss,
  variant = 'error',
}: ErrorBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const variantStyles = {
    error: {
      container:
        'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
      detailsText: 'text-red-700 dark:text-red-300',
    },
    warning: {
      container:
        'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800/30 dark:text-yellow-300',
      icon: 'text-yellow-600 dark:text-yellow-400',
      detailsText: 'text-yellow-700 dark:text-yellow-300',
    },
    info: {
      container:
        'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400',
      detailsText: 'text-blue-700 dark:text-blue-300',
    },
  };

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const styles = variantStyles[variant];

  const renderIcon = () => {
    if (variant === 'error') {
      return (
        <svg
          className={`flex-shrink-0 h-5 w-5 ${styles.icon}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    }
    if (variant === 'warning') {
      return (
        <svg
          className={`flex-shrink-0 h-5 w-5 ${styles.icon}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    }
    // info
    return (
      <svg
        className={`flex-shrink-0 h-5 w-5 ${styles.icon}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  };

  return (
    <div
      className={`border rounded-lg p-4 mb-4 ${styles.container}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {renderIcon()}
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          {details && <p className={`mt-1 text-sm ${styles.detailsText}`}>{details}</p>}
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-50 dark:hover:bg-black dark:hover:bg-opacity-30 rounded transition-colors"
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  return (
    <p className={`text-sm text-red-600 dark:text-red-400 mt-1 ${className}`} role="alert">
      {message}
    </p>
  );
}

interface FormErrorSummaryProps {
  errors: string[];
  title?: string;
}

export function FormErrorSummary({
  errors,
  title = 'Please fix the following errors:',
}: FormErrorSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div
      className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/30 rounded-lg p-4 mb-4"
      role="alert"
    >
      <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">{title}</h3>
      <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
