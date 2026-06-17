'use client';

import {
  forwardRef,
  InputHTMLAttributes,
} from 'react';

import { cn } from '@/lib/utils';

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

const Input = forwardRef<
  HTMLInputElement,
  InputProps
>(
  (
    {
      label,
      error,
      required,
      className,
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

        <input
          ref={ref}
        className={cn(
            'w-full rounded-lg bg-white px-3 py-2.5 text-sm text-slate-900',

            'border-2 transition-all duration-200 ease-out',

            error
                ? 'border-red-500'
                : 'border-slate-300',

            !error &&
                'hover:border-slate-400',

            !error &&
                'focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]',

            error &&
                'focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]',

            'focus:outline-none',

            className
            )}
          {...props}
        />

        {error && (
          <p className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;