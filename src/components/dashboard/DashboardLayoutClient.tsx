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

  const getBreadcrumbs = () => {
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .slice(1); // buang "dashboard"

  return segments.map((segment, index) => {
    const isLast = index === segments.length - 1;

    // UUID atau dynamic route
    if (
      isLast &&
      /^[0-9a-fA-F-]{20,}$/.test(segment)
    ) {
      return 'Detail';
    }

    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  });
};

  const getPageTitle = () => {
  const breadcrumbs = getBreadcrumbs();

  return (
    breadcrumbs[breadcrumbs.length - 1] ||
    'Dashboard'
  );
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
                className={`block px-4 py-2 text-[12px] font-semibold rounded-r-sm transition-colors 
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
      <div className="pb-5 px-6">
        <p className="text-[13px] font-bold text-slate-400">
          Version v1.0.0
        </p>

        <p className="text-[12px] text-slate-400 mt-1">
          © {new Date().getFullYear()} SIDESA
        </p>
      </div>
      </aside>

      {isMobileOpen && (
  <>
    <div
      className="fixed inset-0 bg-black/40 z-40 md:hidden"
      onClick={() => setIsMobileOpen(false)}
    />

    <aside className="fixed left-0 top-0 h-full w-72 bg-[#0f172a] text-slate-300 z-50 md:hidden flex flex-col">
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-md">
            <Building2 className="w-5 h-5 text-white" />
          </div>

          <span className="font-bold text-white">
            Sistem Desa
          </span>
        </div>

        <button
          onClick={() =>
            setIsMobileOpen(false)
          }
          className="text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            pathname={pathname}
            isActive={isActive}
          />
        ))}
      </nav>

      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-semibold">
            Keluar
          </span>
        </button>

        <div className="mt-4 pt-4">
          <p className="text-[13px] font-bold text-slate-400">
            Version v1.0.0
          </p>

          <p className="text-[12px] text-slate-500 mt-1">
            © {new Date().getFullYear()} SIDESA
          </p>
        </div>
      </div>
    </div>
    </aside>
  </>
)}

      {/* Konten */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setIsMobileOpen(true)
            }
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>

             <h2 className="font-bold text-slate-800 text-sm md:text-base">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <NotificationBell />
            </div>

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 md:gap-3 pl-3 md:pl-4 border-l border-slate-200 hover:bg-slate-50 px-2 md:px-3 py-2 transition-colors rounded-lg"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-800" />
              </div>

              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-semibold text-slate-800">
                  {userProfile?.nama_lengkap || 'User'}
                </p>
                <p className="text-xs text-slate-500">
                  Administrator
                </p>
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="hidden md:flex p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="px-4 md:px-6 pt-4 overflow-x-auto">
        <nav className="flex items-center gap-2 text-xs whitespace-nowrap min-w-max">
          <span className="text-slate-400">Dashboard</span>

          {getBreadcrumbs().map((crumb, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="w-3 h-3 text-slate-400" />

              <span
                className={
                  index === getBreadcrumbs().length - 1
                    ? 'font-semibold text-slate-700'
                    : 'text-slate-400'
                }
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}