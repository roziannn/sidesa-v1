import Link from "next/link";
import { ArrowLeft, Building2, FileCheck, Megaphone, ShieldCheck, Users } from "lucide-react";
import LoginForm from "@/components/login/LoginForm";

const FITUR = [
  { icon: FileCheck, text: "Kelola surat & arsip desa" },
  { icon: Megaphone, text: "Tindak lanjut pengaduan warga" },
  { icon: Users, text: "Data kependudukan terintegrasi" },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 dark:bg-[#0a120d]">
      {/* Panel branding */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#04201b] via-[#07372f] to-[#0b4f43] p-12 text-white">
        <div className="absolute -top-28 -left-20 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl animate-float-slow" />
        <div className="absolute bottom-0 -right-24 w-96 h-96 rounded-full bg-teal-300/20 blur-3xl animate-float-slow [animation-delay:3s]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:28px_28px]" />

        <Link href="/" className="relative flex items-center gap-3 w-fit">
          <span className="p-2 rounded-xl bg-white/10 border border-white/15"><Building2 className="w-5 h-5" /></span>
          <span className="font-bold tracking-tight">SIDESA</span>
        </Link>

        <div className="relative">
          <h2 className="animate-fade-up text-4xl font-extrabold leading-tight tracking-tight">
            Kelola desa <br />
            <span className="bg-gradient-to-r from-emerald-300 to-lime-200 bg-clip-text text-transparent">lebih cepat & transparan</span>
          </h2>
          <p className="animate-fade-up [animation-delay:120ms] mt-4 max-w-md text-emerald-50/70 leading-relaxed">
            Satu dashboard untuk seluruh layanan administrasi, pengaduan, dan data Desa Sukamaju.
          </p>
          <ul className="mt-8 space-y-4">
            {FITUR.map((f, i) => (
              <li key={f.text} className="animate-fade-up flex items-center gap-3 text-sm text-emerald-50/90" style={{ animationDelay: `${240 + i * 120}ms` }}>
                <span className="p-2 rounded-xl bg-white/10 border border-white/10 text-emerald-300"><f.icon className="w-4 h-4" /></span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-emerald-100/60">
          <ShieldCheck className="w-4 h-4 text-emerald-300" /> Akses khusus petugas desa. Aktivitas tercatat di audit trail.
        </p>
      </aside>

      {/* Form */}
      <main className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950/40" />
        <Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Beranda
        </Link>

        <div className="animate-fade-up relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl shadow-emerald-900/5 dark:border-white/10 dark:bg-[#101a14]">
          <div className="mb-8">
            <span className="mb-5 flex w-12 h-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30">
              <Building2 className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Selamat datang kembali</h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Masuk untuk mengelola layanan dan data Desa Sukamaju.</p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-xs text-slate-400">
            Lupa kata sandi? Hubungi admin desa untuk reset akun.
          </p>
        </div>
      </main>
    </div>
  );
}
