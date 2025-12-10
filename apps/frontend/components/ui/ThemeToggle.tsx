'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const themeToggleVariants = cva(
  'inline-flex items-center justify-center rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4907a] focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-[#e8e6e1] dark:bg-[#2a2f35] hover:bg-[#d4d2cd] dark:hover:bg-[#3d4449]',
        ghost: 'hover:bg-[#e8e6e1]/50 dark:hover:bg-[#2a2f35]/50',
        outline:
          'border border-[#e8e6e1] dark:border-[#2a2f35] hover:bg-[#e8e6e1]/50 dark:hover:bg-[#2a2f35]/50',
      },
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ThemeToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof themeToggleVariants> {
  showLabel?: boolean;
}

export function ThemeToggle({
  className,
  variant,
  size,
  showLabel = false,
  ...props
}: ThemeToggleProps) {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  if (!mounted) {
    return (
      <button
        className={cn(themeToggleVariants({ variant, size }), className)}
        disabled
        aria-label="Loading theme"
        {...props}
      >
        <Sun className="h-5 w-5 text-[#6b7280]" />
      </button>
    );
  }

  const Icon = theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun;
  const label = theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light';

  return (
    <button
      className={cn(themeToggleVariants({ variant, size }), className)}
      onClick={cycleTheme}
      aria-label={`Current theme: ${label}. Click to change.`}
      {...props}
    >
      <Icon className="h-5 w-5 text-[#3d4449] dark:text-[#f5f3ef]" />
      {showLabel && (
        <span className="ml-2 text-sm text-[#3d4449] dark:text-[#f5f3ef]">{label}</span>
      )}
    </button>
  );
}
