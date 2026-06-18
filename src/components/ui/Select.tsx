'use client';

import {
  forwardRef,
  SelectHTMLAttributes,
} from 'react';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

const Select = forwardRef<
  HTMLSelectElement,
  SelectProps
>(
  (
    {
      label,
      error,
      required,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-semibold text-slate-700">
            {label}

            {required && (
              <span className="ml-1 text-red-500">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full appearance-none rounded-lg bg-white px-3 py-2.5 pr-10 text-sm text-slate-900',

              'border-2 transition-all duration-200 ease-out',

              error
                ? 'border-red-500'
                : 'border-slate-300',

              !error &&
                'hover:border-slate-400',

              !error &&
                'focus:border-emerald-500',

              !error &&
                'focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]',

              error &&
                'focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]',

              'focus:outline-none',

              'disabled:bg-slate-100 disabled:cursor-not-allowed',

              className
            )}
            {...props}
          >
            {children}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        {error && (
          <p className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;