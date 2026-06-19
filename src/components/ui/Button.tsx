'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon'; // Menambahkan xs di sini
  loading?: boolean;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',

        // Penambahan size xs
        size === 'xs' && 'px-3 h-[28px] text-xs rounded',
        size === 'sm' && 'px-3 py-2 text-sm rounded-lg',
        size === 'md' && 'px-4 py-2.5 text-sm rounded-lg',
        size === 'lg' && 'px-5 py-3 text-base rounded-xl',
        size === 'icon' && 'h-5 w-5 p-0 rounded-lg',

        variant === 'primary' && 'bg-emerald-600 text-white hover:bg-emerald-700',
        variant === 'secondary' && 'bg-slate-100 text-slate-700 hover:bg-slate-200',
        variant === 'outline' && 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
        variant === 'warning' && 'bg-yellow-400 text-yellow-950 hover:bg-yellow-500',

        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {leftIcon && !loading && leftIcon}
      
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      
      {loading ? 'Memproses...' : children}
    </button>
  );
}