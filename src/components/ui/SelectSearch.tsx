'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectSearchOption {
  value: string;
  label: string;
}

interface SelectSearchProps {
  label?: string;
  placeholder?: string;

  value?: string;
  options: SelectSearchOption[];

  onChange: (value: string) => void;

  required?: boolean;
  disabled?: boolean;
  error?: string;

  className?: string;
}

export default function SelectSearch({
  label,
  placeholder = 'Cari...',
  value,
  options,
  onChange,
  required,
  disabled,
  error,
  className,
}: SelectSearchProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const [open, setOpen] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const selectedOption =
    options.find(
      (item) =>
        item.value === value
    );

  const filteredOptions =
    useMemo(() => {
      return options.filter(
        (item) =>
          item.label
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [options, search]);

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
  }, []);

  return (
    <div
    ref={containerRef}
    className={cn(
        'relative space-y-1.5',
        className
    )}
    >
      {label && (
        <label className="block text-sm font-bold text-slate-700">
          {label}

          {required && (
            <span className="text-red-500 ml-1">
              *
            </span>
          )}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setOpen(!open)
        }
        className={cn(
          'w-full rounded-lg border bg-white px-3 py-2.5',
          'flex items-center justify-between',
          'text-sm text-left',
          'transition-all',
          'border-slate-300',
          'hover:border-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',

          error &&
            'border-red-500',

          disabled &&
            'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            !selectedOption &&
              'text-slate-400'
          )}
        >
          {selectedOption?.label ||
            placeholder}
        </span>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 transition-transform',
            open &&
              'rotate-180'
          )}
        />
      </button>

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}

      {open && (
        <div
          className="
            absolute z-50 mt-1 w-full
            rounded-xl border border-slate-200
            bg-white shadow-xl
            overflow-hidden
          "
        >
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />

              <input
                autoFocus
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Cari data..."
                className="
                  w-full
                  pl-9 pr-3 py-2
                  rounded-lg
                  border border-slate-200
                  text-sm
                  outline-none
                  focus:border-emerald-500
                "
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length ===
            0 ? (
              <div className="px-3 py-6 text-center text-sm text-slate-500">
                Data tidak ditemukan
              </div>
            ) : (
              filteredOptions.map(
                (option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(
                        option.value
                      );
                      setOpen(false);
                      setSearch('');
                    }}
                    className="
                      w-full
                      px-3 py-2.5
                      text-left text-sm
                      hover:bg-emerald-50
                      transition-colors
                    "
                  >
                    {option.label}
                  </button>
                )
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}