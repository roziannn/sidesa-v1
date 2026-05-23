import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // 1. Inisialisasi Supabase Server Client untuk mengecek sesi di Cookie
  const supabase = await createClient();

  // 2. Ambil data user yang sedang login aktif saat ini
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // Proteksi lapis kedua: Jika cookie kosong/tidak login, tendang balik ke /login
  if (userError || !user) {
    redirect("/login");
  }

  // 3. Ambil detail nama_lengkap & role dari tabel profiles di database warga
  const { data: profile } = await supabase
    .from("profiles")
    .select("nama_lengkap, role")
    .eq("id", user.id)
    .single();

  // Alirkan data profil server ke komponen client visual dashboard
  return (
    <DashboardLayoutClient userProfile={profile}>
      {children}
    </DashboardLayoutClient>
  );
}