"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  
  // State untuk form input dan UI
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset pesan error setiap kali tombol ditekan

    try {
      // 1. Melakukan autentikasi email & password ke Supabase Auth
      const { data, error: authError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      // Jika data auth dari Supabase gagal (misal email tidak terdaftar/password salah)
      if (authError) {
        setError("Email atau password salah. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      if (data?.user) {
        // 2. Mengambil data profil user dari tabel 'profiles' berdasarkan ID user yang login
        const { data: profile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError || !profile) {
          setError("Gagal mengambil data profil. Hubungi admin.");
          setLoading(false);
          return;
        }

        // 3. Pengecekan Hak Akses (Role-Based Redirect)
        if (profile.role === "manager") {
          // Jika petugas berwenang, arahkan ke dashboard utama
          router.push("/dashboard");
          router.refresh();
        } else {
          // Jika warga biasa atau role lain, lempar ke halaman unauthorized
          router.push("/unauthorized");
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Layout utama: Tengah halaman dengan background abu-abu muda
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-slate-200 p-8">
        
        {/* Header/Logo Aplikasi Desa */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-[#15803d] mb-3">
            {/* Ikon Rumah/Gedung Pemerintahan */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A4.833 4.833 0 0012 8.25c-2.106 0-3.956.133-4.5 1.332V21" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Dashboard Desa Digital
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sistem Informasi & Layanan Petugas Desa
          </p>
        </div>

        {/* Alert Error Box */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Alamat Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@desa.go.id"
              required
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-slate-800 text-sm placeholder:text-slate-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-slate-800 text-sm placeholder:text-slate-400 transition"
            />
          </div>

          {/* Tombol Masuk dengan State Loading */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-[#15803d] hover:bg-[#166534] disabled:bg-emerald-800/70 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600"
          >
            {loading ? (
              <>
                {/* Animasi Spinner Loading */}
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses Masuk...
              </>
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}