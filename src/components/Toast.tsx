"use client";

import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";
import { useToast, ToastItem } from "@/hooks/useToast";

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  // Konfigurasi ikon dan warna berdasarkan variant toast
  const variantStyles = {
    success: {
      bg: "bg-white border-emerald-100 shadow-emerald-100/50",
      icon: "text-emerald-600 bg-emerald-50",
      iconComponent: CheckCircle2,
    },
    error: {
      bg: "bg-white border-rose-100 shadow-rose-100/50",
      icon: "text-rose-600 bg-rose-50",
      iconComponent: AlertCircle,
    },
    warning: {
      bg: "bg-white border-amber-100 shadow-amber-100/50",
      icon: "text-amber-600 bg-amber-50",
      iconComponent: AlertTriangle,
    },
  };

  return (
    <>
      {/* Container tetap (fixed) di pojok kanan bawah */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none p-4 sm:p-0">
        {toasts.map((toast: ToastItem) => {
          const style = variantStyles[toast.variant];
          const Icon = style.iconComponent;

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 w-full bg-white border rounded-xl shadow-lg p-4 outline-none transition-all duration-300 animate-slide-in ${style.bg}`}
            >
              {/* Bulatan Ikon Varian */}
              <div className={`p-2 rounded-lg flex items-center justify-center flex-shrink-0 ${style.icon}`}>
                <Icon className="w-5 h-5 stroke-[2.25]" />
              </div>

              {/* Teks Informasi */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-none">
                  {toast.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {toast.message}
                </p>
              </div>

              {/* Tombol Silang X Manual Dismiss */}
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Inject Animasi Slide-In CSS Murni */}
      <style jsx global>{`
        @keyframes toastSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
}