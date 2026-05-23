"use client";

import React, { useEffect, useRef } from "react";
import { TriangleAlert, Loader2 } from "lucide-react";

// 1. Interface Props Sesuai Spesifikasi Pemintaan
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string; // default: "Hapus"
  confirmVariant?: "danger" | "warning" | "primary"; // default: 'danger'
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Hapus",
  confirmVariant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  
  // Ref untuk mengunci fokus keyboard di dalam elemen modal
  const modalRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------------------
  // AKSESIBILITAS: Handle Tekan Tombol Escape & Trap Focus
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;

    // Fungsi menutup modal saat tombol Escape ditekan
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onCancel();
      }

      // Fitur Focus Trapping (Mengunci navigasi tombol Tab)
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex="0"]'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Jika menekan Shift + Tab dan berada di elemen pertama, pindah ke elemen terakhir
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // Jika menekan Tab dan berada di elemen terakhir, kembali ke elemen pertama
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    // Menyimpan elemen yang aktif sebelum modal dibuka agar bisa dikembalikan nanti
    const originalFocusedElement = document.activeElement as HTMLElement;
    
    window.addEventListener("keydown", handleKeyDown);
    // Otomatis arahkan fokus pertama kali ke dalam modal saat terbuka
    modalRef.current?.focus();

    // Cleanup function saat modal ditutup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      originalFocusedElement?.focus();
    };
  }, [isOpen, isLoading, onCancel]);

  // Jika status modal tidak aktif, jangan render apapun ke dalam DOM
  if (!isOpen) return null;

  // 2. Pemetaan Skema Warna Berdasarkan Variant Proyek
  const variantStyles = {
    danger: {
      icon: "text-red-600 bg-red-50 border-red-100",
      button: "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white",
    },
    warning: {
      icon: "text-amber-600 bg-amber-50 border-amber-100",
      button: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 text-white",
    },
    primary: {
      icon: "text-blue-600 bg-blue-50 border-blue-100",
      button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white",
    },
  };

  const currentVariant = variantStyles[confirmVariant];

  return (
    // OVERLAY: Latar belakang gelap semi-transparan dengan posisi tetap (fixed)
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in">
      
      {/* Sisi Luar Backdrop (Jika diklik luar modal, panggil fungsi Batal) */}
      <div 
        className="absolute inset-0" 
        onClick={() => !isLoading && onCancel()} 
      />

      {/* KARTU MODAL (Max-width: 400px dengan Animasi Masuk Scale & Fade) */}
      <div
        ref={modalRef}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-message"
        className="relative w-full max-w-[400px] bg-white rounded-xl border border-slate-200 shadow-xl p-6 overflow-hidden outline-none animate-scale-up"
      >
        <div className="flex flex-col items-center text-center">
          
          {/* Bagian Lingkaran Ikon Peringatan */}
          <div className={`p-3 rounded-full border mb-4 flex items-center justify-center ${currentVariant.icon}`}>
            <TriangleAlert className="w-6 h-6 stroke-[2]" />
          </div>

          {/* Judul & Pesan Konfirmasi */}
          <h3 
            id="modal-title" 
            className="text-lg font-bold text-slate-900 tracking-tight"
          >
            {title}
          </h3>
          <p 
            id="modal-message" 
            className="text-sm text-slate-500 mt-2 leading-relaxed"
          >
            {message}
          </p>
        </div>

        {/* TOMBOL AKSI (Batal di kiri, Konfirmasi di kanan) */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed ${currentVariant.button}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>

      </div>

      {/* Tambahan Style Animasi Murni Menggunakan Tag Style bawaan (Alternatif jika tailwind.config belum diatur) */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scale-up { animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}