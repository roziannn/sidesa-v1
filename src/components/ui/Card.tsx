'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;

  title?: string;
  description?: string;

  headerAction?: ReactNode;
  footer?: ReactNode;

  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';

  className?: string;
}

export default function Card({
  children,
  title,
  description,
  headerAction,
  footer,
  hover = false,
  padding = 'md',
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-xl shadow-sm',

        hover &&
          'transition-all duration-200 hover:shadow-md hover:border-slate-300',

        className
      )}
    >
      {(title || description || headerAction) && (
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div>
            {title && (
              <h3 className="text-base font-bold text-slate-900">
                {title}
              </h3>
            )}

            {description && (
              <p className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>

          {headerAction}
        </div>
      )}

      <div
        className={cn(
          padding === 'sm' && 'p-4',
          padding === 'md' && 'p-6',
          padding === 'lg' && 'p-8'
        )}
      >
        {children}
      </div>

      {footer && (
        <div className="border-t border-slate-100 px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}