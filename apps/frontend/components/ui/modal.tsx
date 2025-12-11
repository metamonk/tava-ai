'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const modalOverlayVariants = cva(
  'fixed inset-0 z-50 flex items-center justify-center bg-black/25 dark:bg-black/50 animate-in fade-in duration-200',
  {
    variants: {
      blur: {
        true: 'backdrop-blur-sm',
        false: '',
      },
    },
    defaultVariants: {
      blur: true,
    },
  }
);

const modalContentVariants = cva(
  'relative bg-white dark:bg-[#161a1d] rounded-xl shadow-xl dark:shadow-none dark:border dark:border-[#2a2f35] animate-in zoom-in-95 fade-in duration-200',
  {
    variants: {
      size: {
        sm: 'max-w-sm w-full mx-4',
        md: 'max-w-md w-full mx-4',
        lg: 'max-w-lg w-full mx-4',
        xl: 'max-w-xl w-full mx-4',
        full: 'max-w-4xl w-full mx-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface ModalProps extends VariantProps<typeof modalContentVariants> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  blur?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size,
  blur = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  // Handle ESC key
  React.useEffect(() => {
    if (!closeOnEscape) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(modalOverlayVariants({ blur }))}
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div className={cn(modalContentVariants({ size }))} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        {(title || description) && (
          <div className="px-6 pt-6 pb-4 border-b border-[#e8e6e1] dark:border-[#2a2f35]">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-[#1a1d21] dark:text-[#f5f3ef]"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-[#6b7280] dark:text-[#9ca3af]">{description}</p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#e8e6e1] dark:border-[#2a2f35] flex justify-end gap-3">
            {footer}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-[#6b7280] hover:text-[#1a1d21] dark:text-[#9ca3af] dark:hover:text-[#f5f3ef] hover:bg-[#e8e6e1] dark:hover:bg-[#2a2f35] transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Convenience wrapper components
export function ModalHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('flex justify-end gap-3 mt-4', className)}>{children}</div>;
}
