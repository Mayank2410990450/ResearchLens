'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'verified' | 'hypothesis' | 'processing' | 'violet' | 'cyan' | 'error' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'md', children, ...props }: BadgeProps) {
  const variants = {
    default:
      'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
    verified:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    hypothesis:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    processing:
      'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 animate-pulse',
    violet:
      'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30',
    cyan:
      'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    error:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    outline:
      'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {variant === 'verified' && <CheckCircle2 className="w-3 h-3" />}
      {variant === 'hypothesis' && <Sparkles className="w-3 h-3" />}
      {variant === 'processing' && <RefreshCw className="w-3 h-3 animate-spin" />}
      {variant === 'error' && <AlertCircle className="w-3 h-3" />}
      {children}
    </span>
  );
}
