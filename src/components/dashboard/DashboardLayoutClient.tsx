/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { House, Users, HandHeart, Calendar, FileText, Wallet, Menu, X, LogOut, User, FileWarning, Box, Building2, ChevronDown } from "lucide-react";
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
    { name: "Data Kegiatan", href: "/dashboard/kegiatan", icon: Calendar },
    { name: "Bantuan Sosial", href: "/dashboard/bansos", icon: HandHeart },
    { name: "Surat Administrasi", href: "/dashboard/surat", icon: FileText },
    { name: "Pengaduan", href: "/dashboard/pengaduan", icon: FileWarning },

    {
      name: "Retribusi",
      href: "/dashboard/retribusi", // TAMBAHKAN INI agar tidak undefined
      icon: Wallet,
      children: [
        { name: "Manajemen", href: "/dashboard/retribusi" },
        { name: "Riwayat", href: "/dashboard/retribusi/riwayat" },
        { name: "Laporan", href: "/dashboard/retribusi/laporan" },
      ],
    },
    { name: "Pengaduan", href: "/dashboard/pengaduan", icon: FileWarning },
  ];

  const SidebarMenu = ({ item, pathname }: { item: any; pathname: string }) => {
    // Gunakan optional chaining dan fallback ke string kosong ""
    const [isOpen, setIsOpen] = useState(item.href ? pathname.startsWith(item.href) : false);

    if (item.children) {
      return (
        <div className="space-y-1">
          <button onClick={() => setIsOpen(!isOpen)} className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 rounded-md text-[13px] font-medium transition-all ${isOpen ? "text-white" : "text-slate-400 hover:text-white"}`}>
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </div>
            <span className={`text-[10px] transition-transform ${isOpen ? "rotate-180" : ""}`}>
              <ChevronDown className="w-4 h-4" />
            </span>
          </button>

          {isOpen && (
            <div className="ml-8 space-y-1 border-l border-[#1e293b] pl-2">
              {item.children.map((child: any) => (
                <Link
                  key={child.href}
                  href={child.href}
                  // Pastikan child.href juga aman
                  className={`block px-4 py-2 text-[12px] rounded-md transition-colors ${pathname === child.href ? "text-emerald-400 bg-[#1e293b]" : "text-slate-500 hover:text-slate-300"}`}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Link biasa tanpa children
    // Pastikan item.href ada, jika tidak gunakan "/" sebagai fallback
    const href = item.href || "/";
    const isActive = pathname === href;

    return (
      <Link
        href={href}
        className={`group flex items-center gap-3 px-4 py-2.5 rounded-md text-[13px] font-medium transition-all ${
          isActive ? "bg-[#1e293b] text-emerald-400 border-l-2 border-emerald-500" : "text-slate-400 hover:bg-[#1e293b]/50 hover:text-white"
        }`}
      >
        <item.icon className="w-4 h-4" />
        <span>{item.name}</span>
      </Link>
    );
  };

  // PERBAIKAN LOGIKA 1: Deteksi menu aktif secara hierarki/induk rute (Aman untuk Tambah/Edit/Detail)
  // Ganti fungsi checkIsActive menjadi:
  const checkIsActive = (href?: string) => {
    if (!href) return false; // Jika href tidak ada, anggap tidak aktif
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const getPageTitle = () => {
    const findActiveMenu = (items: any[]): string | null => {
      for (const item of items) {
        // Cek apakah pathname sama dengan href item (prioritas utama)
        if (item.href && pathname === item.href) return item.name;

        // Jika memiliki children, cari di dalam children
        if (item.children) {
          const childMatch = findActiveMenu(item.children);
          if (childMatch) return childMatch;
        }
      }
      // Jika tidak ditemukan, coba cari berdasarkan prefix (untuk halaman edit/detail)
      for (const item of items) {
        if (item.href && pathname.startsWith(item.href)) return item.name;
      }
      return "Menu Desa";
    };

    return findActiveMenu(menuItems) || "Menu Desa";
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
    <div className="h-screen flex bg-[#f9fafb] text-slate-800 antialiased selection:bg-emerald-500/30">
      <aside className="hidden md:flex flex-col w-65 h-full bg-[#0f172a] text-slate-300 flex-shrink-0 border-r border-[#1e293b] print:hidden">
        {/* Header Logo */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-[#1e293b]/50">
          {/* Ikon Lucide sebagai pengganti emoji */}
          <div className="bg-emerald-600 p-2 rounded-md">
            <Building2 className="w-5 h-5 text-white" />
          </div>

          {/* Nama Sistem & Lokasi */}
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm leading-tight">Sistem Desa Digital</span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">Desa Sukamaju - Kab. Bekasi</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {menuItems.map((item, idx) => (
            <SidebarMenu key={idx} item={item} pathname={pathname} />
          ))}
        </nav>

        {/* Bottom Info */}
        <div className="p-4 border-[#1e293b]">
          <div className="text-[10px] text-slate-500 uppercase font-semibold mb-2">Versi Sistem</div>
          <div className="text-slate-400 text-xs font-mono">v.2026.06.05</div>
        </div>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* 2. SIDEBAR MOBILE DRAWER (Berubah jadi Pop-up di Handphone)       */}
      {/* ---------------------------------------------------------------- */}
      {/* Backdrop Hitam Transparan saat Menu Terbuka */}
      {isMobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity print:hidden" onClick={() => setIsMobileOpen(false)} />}

      <aside className={`fixed top-0 bottom-0 left-0 w-[240px] bg-[#14532d] text-white z-50 p-4 flex flex-col transform transition-transform duration-300 md:hidden print:hidden ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="pb-6 mb-6 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            {/* Ikon Lucide sebagai pengganti emoji */}
            <div className="bg-emerald-600 p-2 rounded-md">
              <Building2 className="w-5 h-5 text-white" />
            </div>

            {/* Nama Sistem & Lokasi */}
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm leading-tight">Sistem Desa Digital</span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">Desa Sukamaju, Kabupaten Bekasi</span>
            </div>

            {/* Tombol X untuk Menutup Menu (Ditempatkan di ujung kanan) */}
            <button onClick={() => setIsMobileOpen(false)} className="ml-auto text-slate-400 hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
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
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* HEADER (Tinggi 64px, background putih) */}
        <header className="h-14 md:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileOpen(true)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 md:hidden rounded-md transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-slate-800 text-[15px] tracking-tight border-l-2 border-emerald-600 pl-4">{getPageTitle()}</h2>
          </div>

          {/* Sisi Kanan: User Actions */}
          <div className="flex items-center gap-5">
            {/* Notification Bell */}
            <div className="text-slate-400 hover:text-emerald-700 transition-colors">
              <NotificationBell />
            </div>

           {/* Profil Pengguna */}
            <Link href="/dashboard/profile" className="flex items-center gap-3 pl-5 border-l border-slate-200 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-bold text-slate-800 leading-tight">
                  {userProfile?.nama_lengkap || "Petugas Desa"}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-medium">
                  {userProfile?.role || "Petugas"}
                </p>
              </div>
            </Link>

            {/* Logout Button */}
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200" title="Keluar dari sistem">
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
