import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  // Ambil profil
  const { data: profile } = await supabase.from("profiles").select("nama_lengkap, role").eq("id", user.id).single();

  // Ambil notifikasi (Hanya yang belum dibaca)
  const { data: initialNotifs } = await supabase.from("notifikasi").select("*").eq("user_id", user.id).eq("is_read", false).order("created_at", { ascending: false });

  return (
    <DashboardLayoutClient userProfile={profile} initialNotifs={initialNotifs || []}>
      {children}
    </DashboardLayoutClient>
  );
}
