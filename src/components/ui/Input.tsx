'use client';

import {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useId,
} from 'react';

import { cn } from '@/lib/utils';

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  labelClassName?: string;
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
      leftIcon,
      rightIcon,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-slate-700"
          >
            {label}

            {required && (
              <span className="ml-1 text-red-500">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-500">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-lg bg-white text-sm text-slate-900',

              'border transition-all duration-200 ease-out',

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

              'disabled:cursor-not-allowed disabled:bg-slate-100',

              leftIcon
                ? 'pl-10'
                : 'pl-3',

              rightIcon
                ? 'pr-10'
                : 'pr-3',

              'py-2',

              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-slate-500">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';

export default Input;