'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glow' | 'glass' | 'interactive';
  glowColor?: 'violet' | 'cyan' | 'emerald';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', glowColor = 'violet', children, ...props }, ref) => {
    const glowClasses = {
      violet: 'hover:border-violet-500/40 hover:shadow-glow',
      cyan: 'hover:border-cyan-500/40 hover:shadow-glow-cyan',
      emerald: 'hover:border-emerald-500/40 hover:shadow-glow-emerald',
    };

    const variants = {
      default:
        'bg-white dark:bg-navy-900/80 border border-slate-200 dark:border-slate-800/80 shadow-sm rounded-2xl',
      glass:
        'glass-panel rounded-2xl shadow-glass',
      glow:
        'glass-panel-glow rounded-2xl',
      interactive:
        cn(
          'glass-panel rounded-2xl cursor-pointer glass-card-hover',
          glowClasses[glowColor]
        ),
    };

    return (
      <motion.div
        ref={ref}
        className={cn(variants[variant], 'p-5 transition-all duration-300', className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100', className)} {...props} />
);

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-slate-500 dark:text-slate-400', className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('pt-0', className)} {...props} />
);

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center pt-4 border-t border-slate-100 dark:border-slate-800/60', className)} {...props} />
);
