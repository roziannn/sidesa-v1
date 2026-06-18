'use client';

import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;

  disabled?: boolean;
  label?: string;
  description?: string;

  className?: string;
}

export default function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  className,
}: ToggleProps) {
  return (
    <label
      className={cn(
        'flex items-center justify-between gap-4',
        disabled &&
          'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {(label || description) && (
        <div>
          {label && (
            <p className="text-sm font-semibold text-slate-800">
              {label}
            </p>
          )}

          {description && (
            <p className="text-xs text-slate-500 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) =>
            onChange(e.target.checked)
          }
          className="peer sr-only"
        />

        <div
          className={cn(
            'h-6 w-11 rounded-full transition-colors duration-200',
            checked
              ? 'bg-emerald-600'
              : 'bg-slate-200'
          )}
        />

        <div
          className={cn(
            'absolute top-[2px] left-[2px]',
            'h-5 w-5 rounded-full bg-white',
            'shadow-sm border border-slate-200',
            'transition-transform duration-200',
            checked &&
              'translate-x-5'
          )}
        />
      </div>
    </label>
  );
}