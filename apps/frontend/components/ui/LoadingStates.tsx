'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <svg
        className={`${sizeClasses[size]} animate-spin text-blue-600 dark:text-blue-400`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#161a1d] rounded-lg p-6 flex flex-col items-center gap-4 shadow-xl dark:shadow-none dark:border dark:border-[#2a2f35]">
        <LoadingSpinner size="lg" />
        <p className="text-gray-700 dark:text-[#9ca3af] font-medium">{message}</p>
      </div>
    </div>
  );
}

export function SkeletonPlanCard() {
  return (
    <div className="border dark:border-[#2a2f35] rounded-lg p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-[#2a2f35] rounded w-3/4" />
      <div className="h-4 bg-gray-200 dark:bg-[#2a2f35] rounded w-1/2" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-[#2a2f35] rounded" />
        <div className="h-4 bg-gray-200 dark:bg-[#2a2f35] rounded w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-[#2a2f35] rounded w-4/5" />
      </div>
    </div>
  );
}

export function SkeletonSessionRow() {
  return (
    <div className="border-b dark:border-[#2a2f35] p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-gray-200 dark:bg-[#2a2f35] rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-[#2a2f35] rounded w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-[#2a2f35] rounded w-1/4" />
        </div>
        <div className="h-8 w-20 bg-gray-200 dark:bg-[#2a2f35] rounded" />
      </div>
    </div>
  );
}

export function SkeletonClientCard() {
  return (
    <div className="border dark:border-[#2a2f35] rounded-lg p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 bg-gray-200 dark:bg-[#2a2f35] rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-[#2a2f35] rounded w-2/3" />
          <div className="h-3 bg-gray-200 dark:bg-[#2a2f35] rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function LoadingButton({
  isLoading,
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`relative inline-flex items-center justify-center gap-2 ${className} ${
        isLoading ? 'opacity-80 cursor-wait' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading && <LoadingSpinner size="sm" className="p-0" />}
      <span className={isLoading ? 'opacity-0' : ''}>{children}</span>
      {isLoading && <span className="absolute">{children}</span>}
    </button>
  );
}
