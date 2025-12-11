'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-[#faf8f5] dark:bg-[#0f1114]', className)}>{children}</div>
  );
}

interface DashboardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardHeader({ children, className }: DashboardHeaderProps) {
  return (
    <header
      className={cn(
        'bg-white dark:bg-[#161a1d] shadow-sm dark:shadow-none dark:border-b dark:border-[#2a2f35]',
        className
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
    </header>
  );
}

interface DashboardMainProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardMain({ children, className }: DashboardMainProps) {
  return (
    <main className={cn('max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8', className)}>{children}</main>
  );
}

interface DashboardTitleProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardTitle({ title, subtitle, actions }: DashboardTitleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1d21] dark:text-[#f5f3ef]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#6b7280] dark:text-[#9ca3af]">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

interface BackLinkProps {
  href: string;
  label?: string;
}

export function BackLink({ href, label = 'Back' }: BackLinkProps) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 text-sm text-[#c4907a] hover:text-[#a67462] dark:text-[#d4a08a] dark:hover:text-[#c4907a] transition-colors mb-4"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </a>
  );
}
