"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { House, Users, HandHeart, Calendar, FileText, Wallet, Menu, X, LogOut, User, FileWarning, Box } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import NotificationBell from "@/components/NotificationBell";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  userProfile: {
    nama_lengkap: string;
    role: string;
  } | null;
}

export default function DashboardLayoutClient({ children, userProfile }: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  // State untuk mengontrol drawer menu di handphone/mobile
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Daftar menu navigasi sesuai spesifikasi
  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: House },
    { name: "Data Keluarga", href: "/dashboard/keluarga", icon: Users },
    { name: "Data Aset", href: "/dashboard/aset", icon: Box },
    { name: "Bantuan Sosial", href: "/dashboard/bansos", icon: HandHeart },
    { name: "Kegiatan Desa", href: "/dashboard/kegiatan", icon: Calendar },
    { name: "Surat & Izin", href: "/dashboard/surat", icon: FileText },
    { name: "Retribusi", href: "/dashboard/retribusi", icon: Wallet },
    { name: "Pengaduan", href: "/dashboard/pengaduan", icon: FileWarning },
  ];

  // PERBAIKAN LOGIKA 1: Deteksi menu aktif secara hierarki/induk rute (Aman untuk Tambah/Edit/Detail)
  const checkIsActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  // PERBAIKAN LOGIKA 2: Mengambil judul halaman dinamis secara cerdas dari hierarki rute aktif
  const getPageTitle = () => {
    // Cari menu yang berawalan sama dengan pathname, diurutkan dari yang paling spesifik (panjang string)
    const activeMenu = [...menuItems].reverse().find((item) => (item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)));

    return activeMenu ? activeMenu.name : "Menu Desa";
  };

  // Fungsi untuk menangani proses keluar/logout petugas
  const handleLogout = async () => {
    const confirmLogout = confirm("Apakah Anda yakin ingin keluar dari sistem?");
    if (confirmLogout) {
      await supabaseClient.auth.signOut();
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f9fafb] text-slate-800 antialiased selection:bg-emerald-500/30">
      {/* ---------------------------------------------------------------- */}
      {/* 1. SIDEBAR DESKTOP (Lebar: 240px, Tersembunyi di bawah md screen) */}
      {/* ---------------------------------------------------------------- */}
      <aside className="hidden md:flex flex-col w-[240px] bg-[#14532d] text-white flex-shrink-0 border-r border-emerald-950 print:hidden">
        {/* Logo/Nama Aplikasi Desa */}
        <div className="h-16 flex items-center px-6 border-b border-emerald-900 gap-2">
          <span className="text-xl">🏛️</span>
          <span className="font-bold text-emerald-50 tracking-wide text-base">Desa Digital</span>
        </div>

        {/* Daftar Menu */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            // Menggunakan fungsi deteksi rute bercabang baru
            const isActive = checkIsActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-[#15803d] text-white shadow-sm font-semibold" : "text-emerald-100 hover:bg-emerald-800/50 hover:text-white"}`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* 2. SIDEBAR MOBILE DRAWER (Berubah jadi Pop-up di Handphone)       */}
      {/* ---------------------------------------------------------------- */}
      {/* Backdrop Hitam Transparan saat Menu Terbuka */}
      {isMobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity print:hidden" onClick={() => setIsMobileOpen(false)} />}

      <aside className={`fixed top-0 bottom-0 left-0 w-[240px] bg-[#14532d] text-white z-50 p-4 flex flex-col transform transition-transform duration-300 md:hidden print:hidden ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-emerald-900">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <span className="font-bold text-emerald-50">Desa Digital</span>
          </div>
          {/* Tombol X untuk Menutup Menu */}
          <button onClick={() => setIsMobileOpen(false)} className="text-emerald-100 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = checkIsActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)} // Otomatis tutup saat menu diklik
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-[#15803d] text-white font-semibold" : "text-emerald-100 hover:bg-emerald-800/50"}`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* 3. KONTEN UTAMA & HEADER                                         */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER (Tinggi 64px, background putih) */}
        <header className="h-14 md:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-30 print:hidden">
          {/* Sisi Kiri Header */}
          <div className="flex items-center gap-3">
            {/* Tombol Hamburger (Hanya muncul di Layar HP) */}
            <button onClick={() => setIsMobileOpen(true)} className="p-2 -ml-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100 cursor-pointer">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-slate-800 text-sm md:text-lg tracking-tight">{getPageTitle()}</h2>
          </div>

          {/* Sisi Kanan Header (Informasi Profil Warga/Petugas) */}
          {/* Sisi Kanan Header */}
          <div className="flex items-center gap-4">
            {/* Notification */}
            <NotificationBell />

            {/* Profil */}
            <div className="flex items-center gap-2 max-w-[150px] md:max-w-none">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                <User className="w-4 h-4" />
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">{userProfile?.nama_lengkap || "Petugas Desa"}</p>

                <p className="text-xs text-slate-400 capitalize">{userProfile?.role || "Aparatur"}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200" />

            {/* Logout */}
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer" title="Keluar dari sistem">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* KONTEN UTAMA (Scroll secara mandiri dengan padding 24px) */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto focus:outline-none print:p-0 print:overflow-visible">{children}</main>
      </div>
    </div>
  );
}
