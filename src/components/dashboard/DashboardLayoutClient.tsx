/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { House, Users, HandHeart, Calendar, FileText, Wallet, Menu, X, LogOut, User, FileWarning, Building2, ChevronDown, ChevronRight, Activity, ThumbsUp } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import NotificationBell from "@/components/NotificationBell";

export default function DashboardLayoutClient({ children, userProfile }: any) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: House },
    { name: "Data Keluarga", href: "/dashboard/keluarga", icon: Users },
    { name: "Data Kegiatan", href: "/dashboard/kegiatan", icon: Calendar },
    { name: "Bantuan Sosial", href: "/dashboard/bansos", icon: HandHeart },
    { name: "Surat Administrasi", href: "/dashboard/surat", icon: FileText },
    {
      name: "Retribusi",
      href: "/dashboard/retribusi",
      icon: Wallet,
      children: [
        { name: "Manajemen", href: "/dashboard/retribusi" },
        { name: "Riwayat", href: "/dashboard/retribusi/riwayat" },
        { name: "Laporan", href: "/dashboard/retribusi/laporan" },
      ],
    },
    { name: "Pengaduan", href: "/dashboard/pengaduan", icon: FileWarning },
    { name: "Survey Kepuasan", href: "/dashboard/survey-kepuasan", icon: ThumbsUp },
    { name: "Audit Trail", href: "/dashboard/audit-trail", icon: Activity },
  ];

  // Logic aktif rute yang lebih tangguh
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const getPageTitle = () => {
    const routeMap: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/dashboard/keluarga": "Data Keluarga",
      "/dashboard/kegiatan": "Data Kegiatan",
      "/dashboard/bansos": "Bantuan Sosial",
      "/dashboard/bansos/laporan": "Laporan Bansos",
      "/dashboard/surat": "Surat Administrasi",
      "/dashboard/pengaduan": "Pengaduan",
      "/dashboard/retribusi": "Retribusi",
      "/dashboard/profile": "Profil Pengguna"
    };
    return routeMap[pathname] || "Sistem Desa Digital";
  };

  const handleLogout = async () => {
    if (confirm("Keluar dari sistem?")) {
      await supabaseClient.auth.signOut();
      router.push("/login");
      router.refresh();
    }
  };

  const SidebarItem = ({ item, pathname, isActive }: { item: any; pathname: string; isActive: (href: string) => boolean }) => {
  const [isOpen, setIsOpen] = useState(isActive(item.href)); // Default terbuka jika aktif

  if (item.children) {
    return (
      <div className="space-y-1">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-r-sm text-[13px] font-bold transition-all 
            ${isActive(item.href) ? "bg-[#1e293b] text-emerald-400 border-l-4 border-emerald-500" : "text-slate-400 hover:text-white border-l-4 border-transparent"}`}
        >
          <item.icon className="w-4 h-4" />
          <span className="flex-1 text-left">{item.name}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        
        {isOpen && (
          <div className="ml-4 space-y-1 mt-1">
            {item.children.map((child: any) => (
              <Link
                key={child.href}
                href={child.href}
                className={`block px-4 py-2 text-[12px] rounded-r-sm transition-colors 
                  ${pathname === child.href ? "text-emerald-400 bg-[#1e293b]/50 border-l-2 border-emerald-500" : "text-slate-500 hover:text-slate-300 border-l-2 border-transparent"}`}
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-r-sm text-[13px] font-bold transition-all 
        ${isActive(item.href) ? "bg-[#1e293b] text-emerald-400 border-l-4 border-emerald-500" : "text-slate-400 hover:text-white hover:bg-[#1e293b]/50 border-l-4 border-transparent"}`}
    >
      <item.icon className="w-4 h-4" />
      {item.name}
    </Link>
  );
};

  return (
    <div className="h-screen flex bg-[#f9fafb] text-slate-800">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 h-full bg-[#0f172a] text-slate-300">
        <div className="h-16 flex items-center px-6 gap-3 border-b border-[#1e293b]">
          <div className="bg-emerald-600 p-2 rounded-md"><Building2 className="w-5 h-5 text-white" /></div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm">Sistem Desa</span>
          </div>
        </div>

        {/* Navigasi Sidebar */}
        <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.href} 
            item={item} 
            pathname={pathname} 
            isActive={isActive} 
          />
        ))}
      </nav>
      </aside>

      {/* Konten */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            {getPageTitle()}
          </h2>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link href="/dashboard/profile" className="flex items-center gap-2 pl-4 border-l">
              <div className="text-right">
                <p className="text-xs font-bold">{userProfile?.nama_lengkap || "User"}</p>
              </div>
            </Link>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-600"><LogOut className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="px-6 pt-4 text-xs text-slate-400 flex items-center gap-2">
          <span>Dashboard</span>
          {pathname !== "/dashboard" && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="font-semibold text-slate-700">{getPageTitle()}</span>
            </>
          )}
        </div>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}