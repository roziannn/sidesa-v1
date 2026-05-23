"use client";

// Interface data struktur satu buah Toast
export interface ToastItem {
  id: string;
  variant: "success" | "error" | "warning";
  title: string;
  message: string;
}

// Menggunakan pattern listener sederhana agar state toast bisa dipanggil di fungsi mana saja (Global State)
type Listener = (toasts: ToastItem[]) => void;
let activeToasts: ToastItem[] = [];
let listeners: Listener[] = [];

const emit = () => {
  listeners.forEach((listener) => listener([...activeToasts]));
};

export const toastService = {
  // Fungsi utama untuk memunculkan toast dari mana saja
  showToast(variant: "success" | "error" | "warning", title: string, message: string) {
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    const newToast: ToastItem = { id, variant, title, message };
    
    // Masukkan ke dalam stack paling atas
    activeToasts = [...activeToasts, newToast];
    emit();

    // Auto-dismiss otomatis setelah 4 detik (4000ms)
    setTimeout(() => {
      this.dismiss(id);
    }, 4000);
  },

  // Fungsi untuk menghapus toast berdasarkan ID secara manual (Klik tombol X)
  dismiss(id: string) {
    activeToasts = activeToasts.filter((toast) => toast.id !== id);
    emit();
  },

  subscribe(listener: Listener) {
    listeners.push(listener);
    listener([...activeToasts]);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};

// Custom Hook yang akan kamu panggil di komponen 'use client'
import { useState, useEffect } from "react";

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toastService.subscribe(setToasts);
  }, []);

  return {
    toasts,
    showToast: (variant: "success" | "error" | "warning", title: string, message: string) =>
      toastService.showToast(variant, title, message),
    dismissToast: (id: string) => toastService.dismiss(id),
  };
}