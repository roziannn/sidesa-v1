"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { logAuditTrailSafely } from "@/lib/audit-trail/client";
import Input from "@/components/ui/Input"; 
import Button from "@/components/ui/Button"; 

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (authError) {
        await logAuditTrailSafely({
          userRole: "guest",
          module: "Autentikasi",
          activity: "Percobaan login gagal.",
          status: "Gagal",
        });
        setError("Email atau password salah.");
        return;
      }

      if (data?.user) {
        const { data: profile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError || !profile) {
          setError("Data profil tidak ditemukan.");
          return;
        }

        if (profile.role === "manager") {
          await logAuditTrailSafely({
            createdBy: data.user.id,
            userRole: profile.role,
            module: "Autentikasi",
            activity: "Login berhasil.",
            status: "Berhasil",
          });
          router.push("/dashboard");
          router.refresh();
        } else {
          router.push("/unauthorized");
        }
      }
    } catch (err) {
      setError("Kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <Input
        label="Alamat Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="nama@desa.go.id"
        required
        error={error ? " " : undefined} // Menggunakan error prop dari komponen Input
      />

      <Input
        label="Kata Sandi"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        error={error} // Menampilkan pesan error di bawah input
      />

      <Button
        type="submit"
        loading={loading}
        fullWidth
        variant="primary"
        className="mt-2"
      >
        Masuk ke Dashboard
      </Button>
    </form>
  );
}