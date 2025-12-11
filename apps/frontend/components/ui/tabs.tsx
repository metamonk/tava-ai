'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const tabsListVariants = cva('inline-flex items-center', {
  variants: {
    variant: {
      default: 'border-b border-[#e8e6e1] dark:border-[#2a2f35] gap-0',
      pills: 'bg-[#e8e6e1] dark:bg-[#1a1d21] p-1 rounded-xl gap-1',
      buttons: 'gap-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const tabTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4907a] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: [
          'px-4 py-3 -mb-px border-b-2 text-sm',
          'border-transparent text-[#6b7280] dark:text-[#9ca3af]',
          'hover:text-[#1a1d21] dark:hover:text-[#f5f3ef]',
          'data-[state=active]:border-[#c4907a] data-[state=active]:text-[#c4907a]',
        ],
        pills: [
          'px-4 py-2 rounded-lg text-sm',
          'text-[#6b7280] dark:text-[#9ca3af]',
          'hover:text-[#1a1d21] dark:hover:text-[#f5f3ef]',
          'data-[state=active]:bg-white data-[state=active]:dark:bg-[#2a2f35]',
          'data-[state=active]:text-[#1a1d21] data-[state=active]:dark:text-[#f5f3ef]',
          'data-[state=active]:shadow-sm',
        ],
        buttons: [
          'px-4 py-2 rounded-lg text-sm',
          'bg-[#e8e6e1] dark:bg-[#1a1d21] text-[#6b7280] dark:text-[#9ca3af]',
          'hover:bg-[#d1d5db] dark:hover:bg-[#2a2f35]',
          'data-[state=active]:bg-[#c4907a] data-[state=active]:text-white',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  variant: 'default' | 'pills' | 'buttons';
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('Tabs components must be used within a Tabs provider');
  return context;
}

export interface TabsProps extends VariantProps<typeof tabsListVariants> {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  value,
  onValueChange,
  variant = 'default',
  children,
  className,
}: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange, variant: variant || 'default' }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  const { variant } = useTabsContext();
  return (
    <div className={cn(tabsListVariants({ variant }), className)} role="tablist">
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function TabsTrigger({ value, children, className, disabled }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange, variant } = useTabsContext();
  const isActive = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={cn(tabTriggerVariants({ variant }), className)}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: selectedValue } = useTabsContext();
  if (selectedValue !== value) return null;

  return (
    <div role="tabpanel" className={cn('mt-4', className)}>
      {children}
    </div>
  );
}
