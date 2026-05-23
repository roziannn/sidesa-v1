"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-slate-200 p-8 text-center">
        
        {/* Ilustrasi/Ikon Akses Ditolak */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 text-red-600 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        {/* Informasi Teks */}
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-3">
          Akses Terbatas
        </h1>
        
        <p className="text-slate-600 text-sm className leading-relaxed mb-8">
          Maaf, halaman ini hanya dapat diakses oleh petugas desa yang berwenang. 
          Hubungi administrator untuk informasi lebih lanjut mengenai akun Anda.
        </p>

        {/* Tombol Navigasi Kembali */}
        <button
          onClick={() => router.push("/login")}
          className="w-full inline-flex items-center justify-center gap-2 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:bg-slate-50 font-semibold py-2.5 px-4 rounded-lg text-sm transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600"
        >
          {/* Ikon Panah Kembali */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Kembali ke Login
        </button>

      </div>
    </div>
  );
}