'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Input Variants
 *
 * Input styles following the Tava design system with a focus on
 * warmth and accessibility.
 */
const inputVariants = cva(
  // Base styles
  [
    'flex w-full',
    'font-body text-base',
    'text-[#1a1d21] dark:text-[#f5f3ef]',
    'placeholder:text-[#6b7280]/60 dark:placeholder:text-[#9ca3af]/60',
    'transition-all duration-200',
    'focus:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        // Default - Clean input with border
        default: [
          'bg-white dark:bg-[#161a1d]',
          'border border-[#e8e6e1] dark:border-[#2a2f35]',
          'focus:border-[#c4907a] focus:ring-2 focus:ring-[#c4907a]/20',
        ],
        // Filled - Subtle background
        filled: [
          'bg-[#faf8f5] dark:bg-[#1a1d21]',
          'border border-transparent',
          'focus:bg-white dark:focus:bg-[#161a1d]',
          'focus:border-[#c4907a] focus:ring-2 focus:ring-[#c4907a]/20',
        ],
        // Ghost - Minimal, underline only
        ghost: [
          'bg-transparent',
          'border-b border-[#e8e6e1] dark:border-[#2a2f35]',
          'rounded-none',
          'focus:border-[#c4907a]',
          'px-0',
        ],
        // Glass - Glassmorphism style
        glass: [
          'bg-white/70 dark:bg-[#161a1d]/70',
          'backdrop-blur-xl',
          'border border-white/30 dark:border-white/10',
          'focus:border-[#c4907a]/50 focus:ring-2 focus:ring-[#c4907a]/20',
        ],
      },
      inputSize: {
        sm: 'h-9 px-3 text-sm rounded-lg',
        md: 'h-11 px-4 text-base rounded-xl',
        lg: 'h-14 px-5 text-lg rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Icon to show at the start of the input */
  leftIcon?: React.ReactNode;
  /** Icon or element to show at the end of the input */
  rightIcon?: React.ReactNode;
  /** Error state */
  isError?: boolean;
  /** Error message to display */
  errorMessage?: string;
}

/**
 * Input Component
 *
 * A styled input field with support for icons, error states, and multiple variants.
 *
 * @example
 * ```tsx
 * <Input
 *   placeholder="Enter your email"
 *   leftIcon={<Mail className="w-4 h-4" />}
 * />
 *
 * <Input
 *   variant="filled"
 *   inputSize="lg"
 *   isError
 *   errorMessage="Please enter a valid email"
 * />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      leftIcon,
      rightIcon,
      isError,
      errorMessage,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon;

    const inputElement = (
      <input
        type={type}
        className={cn(
          inputVariants({ variant, inputSize }),
          hasLeftIcon && 'pl-11',
          hasRightIcon && 'pr-11',
          isError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        ref={ref}
        aria-invalid={isError}
        {...props}
      />
    );

    // Simple input without icons
    if (!hasLeftIcon && !hasRightIcon && !errorMessage) {
      return inputElement;
    }

    // Input with icons and/or error message
    return (
      <div className="relative">
        {hasLeftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] dark:text-[#9ca3af]">
            {leftIcon}
          </div>
        )}

        {inputElement}

        {hasRightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280] dark:text-[#9ca3af]">
            {rightIcon}
          </div>
        )}

        {errorMessage && (
          <p className="mt-1.5 text-sm text-red-500" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

/**
 * Textarea Component
 *
 * A styled textarea that matches the Input component design.
 */
export interface TextareaProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    Omit<VariantProps<typeof inputVariants>, 'inputSize'> {
  /** Error state */
  isError?: boolean;
  /** Error message to display */
  errorMessage?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, isError, errorMessage, ...props }, ref) => {
    return (
      <div>
        <textarea
          className={cn(
            inputVariants({ variant }),
            'min-h-[120px] py-3 px-4 rounded-xl resize-none',
            isError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          ref={ref}
          aria-invalid={isError}
          {...props}
        />
        {errorMessage && (
          <p className="mt-1.5 text-sm text-red-500" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

/**
 * InputGroup Component
 *
 * Wrapper for creating input groups with labels and helper text.
 */
export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Label for the input */
  label?: string;
  /** Helper text shown below the input */
  helperText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** ID to connect label with input */
  htmlFor?: string;
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, label, helperText, required, htmlFor, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {label && (
          <label
            htmlFor={htmlFor}
            className="block text-sm font-medium text-[#1a1d21] dark:text-[#f5f3ef]"
          >
            {label}
            {required && <span className="text-[#c4907a] ml-1">*</span>}
          </label>
        )}
        {children}
        {helperText && <p className="text-sm text-[#6b7280] dark:text-[#9ca3af]">{helperText}</p>}
      </div>
    );
  }
);
InputGroup.displayName = 'InputGroup';

/**
 * SearchInput Component
 *
 * Pre-configured input for search functionality.
 */
const SearchInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'leftIcon'>>(
  ({ placeholder = 'Search...', ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        placeholder={placeholder}
        leftIcon={
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        {...props}
      />
    );
  }
);
SearchInput.displayName = 'SearchInput';

export { Input, Textarea, InputGroup, SearchInput, inputVariants };
