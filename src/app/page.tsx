"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2, MapPin, Clock, ArrowRight, Phone, Mail, Users, ChevronRight, FileCheck,
  Landmark, Megaphone, UserCircle, BookOpenText, Target, Menu, X, ShieldCheck,
  Sprout, Store, Mountain, PenLine, Wallet, TrendingUp, Home, Sparkles, CalendarDays, Flag, Quote, ArrowUp, Moon, Sun, MonitorSmartphone, Route, HeartPulse,
} from "lucide-react";
import { Reveal, CountUp } from "@/components/landing/Reveal";

const NAV = [
  { label: "Beranda", href: "#beranda" },
  { label: "Layanan", href: "#layanan" },
  { label: "Profil", href: "#profil" },
  { label: "Data Desa", href: "#data" },
  { label: "Transparansi", href: "#transparansi" },
  { label: "Kabar", href: "#kabar" },
];

const SERVICES = [
  { title: "Surat Online", desc: "Ajukan & unduh surat keterangan tanpa antre.", icon: FileCheck, href: "/layanan/surat/unduh", color: "from-green-500 to-green-500" },
  { title: "Pengaduan Warga", desc: "Sampaikan keluhan, pantau tindak lanjutnya.", icon: Megaphone, href: "/pengaduan", color: "from-amber-500 to-orange-500" },
  { title: "E-Signature", desc: "Tanda tangan surat secara digital, sah dan tanpa tatap muka.", icon: PenLine, href: "/dashboard/surat", color: "from-sky-500 to-blue-500", badge: true },
  { title: "Bantuan Sosial", desc: "Informasi penerima dan penyaluran bansos.", icon: Landmark, href: "/dashboard", color: "from-violet-500 to-fuchsia-500" },
];

const STATS = [
  { to: 3, label: "Dusun", icon: Home, decimals: 0 },
  { to: 3763, label: "Kepala Keluarga", icon: Users, decimals: 0 },
  { to: 10374, label: "Jumlah Jiwa", icon: UserCircle, decimals: 0 },
  { to: 667.87, label: "Luas Wilayah (Ha)", icon: Mountain, decimals: 2 },
];

const POTENSI = [
  {
    title: "UMKM Lokal", desc: "Kemandirian ekonomi lewat kerajinan tangan dan olahan khas warga.", icon: Store,
    to: 120, suffix: "+", unit: "Pelaku UMKM", items: ["Kerajinan bambu", "Keripik singkong", "Batik tulis"],
  },
  {
    title: "Wisata Alam", desc: "Kawasan agrowisata dengan pemandangan asri dan edukasi lingkungan.", icon: Mountain,
    to: 5, suffix: "", unit: "Destinasi Wisata", items: ["Agrowisata", "Curug", "Kampung edukasi"],
  },
  {
    title: "Hasil Bumi", desc: "Komoditas pertanian unggulan dengan standar distribusi modern.", icon: Sprout,
    to: 320, suffix: " Ha", unit: "Lahan Pertanian", items: ["Padi", "Kelapa", "Gula aren"],
  },
];

const PROGRAM = [
  { title: "Digitalisasi Layanan", desc: "Surat, pengaduan, dan survei kepuasan kini bisa diakses dari rumah.", icon: MonitorSmartphone, pct: 92 },
  { title: "Pemberdayaan UMKM", desc: "Pelatihan, pendampingan, dan etalase produk khas warga desa.", icon: Store, pct: 75 },
  { title: "Infrastruktur Desa", desc: "Perbaikan jalan usaha tani, saluran air, dan fasilitas umum.", icon: Route, pct: 88 },
  { title: "Kesehatan & Posyandu", desc: "Pemantauan gizi balita dan layanan posyandu yang lebih rutin.", icon: HeartPulse, pct: 80 },
];

const ANGGARAN_COLORS = ["bg-green-700", "bg-green-500", "bg-green-400", "bg-green-300", "bg-green-200"];

const TOTAL_JIWA = 10374;

const GENDER = [
  { l: "Laki-laki", v: 5231, color: "#16a34a" },
  { l: "Perempuan", v: 5143, color: "#86efac" },
];

const USIA = [
  { l: "Anak (0–14 th)", v: 2490 },
  { l: "Produktif (15–64 th)", v: 7158 },
  { l: "Lansia (65+ th)", v: 726 },
];


const ANGGARAN = [
  { l: "Pembangunan Desa", v: "Rp 540 jt", pct: 45 },
  { l: "Pemberdayaan Masyarakat", v: "Rp 240 jt", pct: 20 },
  { l: "Penyelenggaraan Pemerintahan", v: "Rp 180 jt", pct: 15 },
  { l: "Pembinaan Kemasyarakatan", v: "Rp 180 jt", pct: 15 },
  { l: "Penanggulangan Bencana", v: "Rp 60 jt", pct: 5 },
];

const SEJARAH = [
  { year: "1980", text: "Desa Sukamaju resmi berdiri hasil pemekaran wilayah." },
  { year: "2005", text: "Pembangunan infrastruktur jalan dan irigasi pertanian." },
  { year: "2026", text: "Peluncuran SIDESA, layanan desa digital untuk warga." },
];

const MISI = [
  { title: "Pelayanan Digital", desc: "Meningkatkan kualitas pelayanan publik berbasis digital.", icon: MonitorSmartphone },
  { title: "Ekonomi Lokal", desc: "Mengembangkan potensi ekonomi lokal melalui UMKM.", icon: Store },
  { title: "Tata Kelola Terbuka", desc: "Meningkatkan transparansi tata kelola pemerintahan desa.", icon: ShieldCheck },
];

const LEMBAGA = [
  { name: "BPD", icon: Landmark },
  { name: "LPM", icon: Users },
  { name: "Karang Taruna", icon: Sparkles },
  { name: "Kader Posyandu", icon: HeartPulse },
  { name: "MUI Desa", icon: BookOpenText },
  { name: "Satlinmas", icon: ShieldCheck },
  { name: "PKK", icon: Home },
  { name: "Gapoktan", icon: Sprout },
];

const BERITA = [
  {
    tag: "Lingkungan", title: "Gotong Royong Kebersihan Lingkungan Desa", date: "12 Okt 2026", read: "3 mnt baca",
    excerpt: "Ratusan warga dari tiga dusun bahu-membahu membersihkan saluran air, jalan, dan fasilitas umum dalam kegiatan rutin bulanan.",
    img: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=1200&q=80",
  },
  {
    tag: "Layanan", title: "Layanan Surat Online Kini Tersedia 24 Jam", date: "5 Okt 2026", read: "2 mnt baca",
    excerpt: "Warga kini dapat mengajukan surat keterangan kapan saja tanpa antre di kantor desa.",
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80",
  },
  {
    tag: "Pembangunan", title: "Progres Pembangunan Jalan Usaha Tani Capai 88%", date: "28 Sep 2026", read: "4 mnt baca",
    excerpt: "Pembangunan jalan usaha tani ditargetkan rampung bulan depan untuk memperlancar distribusi hasil panen.",
    img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
  },
];

export default function LandingPage() {
  const [currentTime, setCurrentTime] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("beranda");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const loadTheme = () => {
      try {
        const saved = localStorage.getItem("sidesa-theme");
        setDark(saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
      } catch {}
    };
    loadTheme();
  }, []);

  const toggleDark = () =>
    setDark((d) => {
      try { localStorage.setItem("sidesa-theme", d ? "light" : "dark"); } catch {}
      return !d;
    });

  useEffect(() => {
    const tick = () =>
      setCurrentTime(
        new Date()
          .toLocaleString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })
          .replace(/\./g, ":")
      );
    tick();
    const timer = setInterval(tick, 1000);
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
      let cur = "beranda";
      for (const n of NAV) {
        const el = document.getElementById(n.href.slice(1));
        if (el && el.getBoundingClientRect().top <= 140) cur = n.href.slice(1);
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className={`${dark ? "dark" : ""} min-h-screen bg-slate-50 text-slate-800 overflow-x-clip transition-colors duration-300`}>
      {/* Top Bar */}
      <div className="hidden md:flex bg-[#052e16] text-green-100/80 py-2 px-6 text-xs justify-between items-center">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Desa Sukamaju, Kec. Pangandaran</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Senin - Jumat: 08.00 - 15.00 WIB</span>
        </div>
        <div className="font-mono">{currentTime || "Memuat waktu..."}</div>
      </div>

      {/* Progress bar scroll */}
      <div className="fixed top-0 inset-x-0 z-[60] h-1 bg-transparent pointer-events-none" aria-hidden>
        <div className="h-full origin-left bg-gradient-to-r from-green-500 to-green-300 shadow-[0_0_10px_rgba(34,197,94,0.7)]" style={{ transform: `scaleX(${progress})` }} />
      </div>

      {/* Navbar */}
      <div className="sticky top-0 z-50 h-0">
        <div className="px-3 sm:px-6 pt-3">
          <nav className={`max-w-7xl mx-auto rounded-[2rem] border backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ${scrolled ? "bg-white/80 border-white/60 shadow-xl shadow-green-950/10 dark:bg-[#101a14]/80 dark:border-white/10" : "bg-white/60 border-white/40 shadow-lg shadow-green-950/5 dark:bg-[#101a14]/60 dark:border-white/10"}`}>
            <div className="h-16 pl-5 pr-3 flex items-center justify-between gap-4">
              <a href="#beranda" className="flex items-center gap-3 group">
                <div className="bg-gradient-to-br from-green-500 to-green-700 p-2 rounded-xl shadow-lg shadow-green-600/30 group-hover:rotate-6 transition-transform">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="leading-tight">
                  <span className="block text-lg font-bold text-slate-900">SIDESA</span>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest">Desa Sukamaju</span>
                </div>
              </a>
              <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
                {NAV.map((m) => {
                  const on = active === m.href.slice(1);
                  return (
                    <a key={m.label} href={m.href} className={`px-4 py-2 rounded-full transition-colors ${on ? "text-green-600 font-semibold" : "hover:text-green-700 hover:bg-green-50"}`}>{m.label}</a>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <Link href="/pengaduan" className="hidden md:inline-flex items-center px-5 py-2.5 text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-full hover:border-green-300 hover:text-green-700 active:scale-95 transition-all">
                  Pengaduan
                </Link>
                <Link href="/login" className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 active:scale-95 transition-all">
                  Masuk <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={toggleDark}
                  aria-label={dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
                  title={dark ? "Mode terang" : "Mode gelap"}
                  className="relative w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center overflow-hidden hover:border-green-300 hover:text-green-600 active:scale-95 transition-all"
                >
                  <Sun className={`absolute w-[18px] h-[18px] transition-all duration-300 ${dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
                  <Moon className={`absolute w-[18px] h-[18px] transition-all duration-300 ${dark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
                </button>
                <button onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" className="lg:hidden p-2.5 rounded-full hover:bg-slate-100">
                  {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className={`lg:hidden grid transition-all duration-300 ${menuOpen ? "grid-rows-[1fr] border-t border-slate-100" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <div className="px-5 py-3 flex flex-col">
                  {NAV.map((m) => (
                    <a key={m.label} href={m.href} onClick={() => setMenuOpen(false)} className={`py-3 text-sm font-medium ${active === m.href.slice(1) ? "text-green-600 font-semibold" : "text-slate-700 hover:text-green-700"}`}>{m.label}</a>
                  ))}
                  <Link href="/login" className="mt-2 mb-2 text-center px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-full">Masuk</Link>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Tombol kembali ke atas */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Kembali ke atas"
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center shadow-xl shadow-green-700/40 hover:bg-green-500 hover:-translate-y-1 active:scale-95 transition-all duration-300 ${scrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* Hero */}
      <header id="beranda" className="relative isolate overflow-hidden bg-gradient-to-br from-[#052e16] via-[#14532d] to-[#166534] text-white">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-green-400/20 blur-3xl animate-float-slow" />
        <div className="absolute top-40 -right-24 w-[26rem] h-[26rem] rounded-full bg-green-300/20 blur-3xl animate-float-slow [animation-delay:3s]" />
        <div className="absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="max-w-7xl mx-auto px-6 pt-28 pb-44 lg:pt-36 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="animate-fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-green-200 backdrop-blur">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-green-400 animate-pulse-ring" />
                <span className="relative w-2 h-2 rounded-full bg-green-400" />
              </span>
              Sistem Informasi Desa Digital
            </span>
            <h1 className="animate-fade-up [animation-delay:120ms] mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1]">
              Desa Sukamaju <br />
              <span className="bg-gradient-to-r from-green-300 via-green-200 to-green-200 bg-clip-text text-transparent">Bermartabat & Digital</span>
            </h1>
            <p className="animate-fade-up [animation-delay:240ms] mt-6 text-lg text-green-50/70 max-w-xl leading-relaxed">
              Satu pintu layanan administrasi, pengaduan, dan informasi desa. Transparan, cepat, dan bisa diakses kapan saja dari rumah.
            </p>
            <div className="animate-fade-up [animation-delay:360ms] mt-9 flex flex-wrap gap-4">
              <a href="#layanan" className="group inline-flex items-center gap-2 px-6 py-3.5 bg-green-500 hover:bg-green-400 text-[#052e16] rounded-xl font-semibold shadow-xl shadow-green-500/25 hover:-translate-y-0.5 active:scale-95 transition-all">
                Ajukan Layanan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#profil" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl font-semibold backdrop-blur hover:-translate-y-0.5 active:scale-95 transition-all">
                Kenali Desa Kami
              </a>
            </div>
            <div className="animate-fade-up [animation-delay:480ms] mt-10 flex items-center gap-6 text-sm text-green-100/70">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-300" /> Data aman</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-green-300" /> Layanan 24 jam</span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:block animate-fade-up [animation-delay:300ms]">
            <div className="relative mx-auto w-full max-w-md animate-float-slow">
              <div className="rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-semibold">Ringkasan Desa</span>
                  <Sparkles className="w-4 h-4 text-green-300" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { l: "Penduduk", v: "10.374" },
                    { l: "Keluarga", v: "3.763" },
                    { l: "Surat Selesai", v: "1.248" },
                    { l: "Kepuasan", v: "4,8/5" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-2xl bg-white/10 p-4">
                      <p className="text-[11px] uppercase tracking-wider text-green-200/70">{s.l}</p>
                      <p className="text-2xl font-semibold mt-1">{s.v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl bg-white/10 p-4">
                  <div className="flex justify-between text-xs text-green-100/80 mb-2"><span>Progres Fisik APBDes</span><span>88%</span></div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-[88%] rounded-full bg-gradient-to-r from-green-400 to-green-300" /></div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-8 flex items-center gap-3 rounded-2xl bg-white text-slate-800 px-4 py-3 shadow-xl">
                <div className="p-2 rounded-xl bg-green-100 text-green-700"><FileCheck className="w-5 h-5" /></div>
                <div><p className="text-xs text-slate-500">Surat diproses</p><p className="text-sm font-semibold">Rata-rata 1 hari</p></div>
              </div>
            </div>
          </div>
        </div>

        <svg className="absolute -bottom-px left-0 block w-full h-14 sm:h-20 text-slate-50" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
          <path fill="currentColor" d="M0,48 C240,96 480,0 720,32 C960,64 1200,96 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </header>

      {/* Layanan */}
      <section id="layanan" className="max-w-7xl mx-auto px-6 -mt-14 relative z-10 pb-20 scroll-mt-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 100} className="h-full">
              <Link href={s.href} className="group relative block h-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-green-900/10 hover:-translate-y-2 transition-all duration-300">
                {"badge" in s && s.badge && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-green-600/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Baru
                  </span>
                )}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="mt-5 font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold text-green-700">
                  Buka layanan <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1.5 transition-transform" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Profil */}
      <section id="profil" className="relative isolate max-w-7xl mx-auto px-6 pb-24 scroll-mt-20">
        <div className="bg-woodgrain absolute inset-y-0 left-1/2 -translate-x-1/2 w-screen -z-10 pointer-events-none" aria-hidden />
        <Reveal className="text-center mb-16">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Profil Desa</span>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Mengenal Desa Sukamaju</h2>
          <div className="w-16 h-1 bg-green-600 mt-4 rounded-full mx-auto" />
        </Reveal>

        {/* Sejarah: gambar kiri, teks kanan */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          <Reveal from="left">
            <div className="relative isolate mx-auto max-w-lg lg:max-w-none">
              <div className="absolute -top-4 -left-4 w-2/3 h-2/3 rounded-3xl bg-green-200/60 -z-10" />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-3xl opacity-40 -z-10 [background-image:radial-gradient(#16a34a_1.5px,transparent_1.5px)] [background-size:12px_12px]" />
              <div className="group overflow-hidden rounded-3xl shadow-2xl shadow-green-900/20 aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80" alt="Hamparan sawah Desa Sukamaju" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="absolute -bottom-6 left-6 sm:left-10 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl">
                <div className="p-2.5 rounded-xl bg-green-600 text-white"><Flag className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs text-slate-500">Berdiri sejak</p>
                  <p className="text-xl font-bold text-slate-900">1980</p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal from="right" delay={150}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
              <BookOpenText className="w-4 h-4" /> Sejarah Desa
            </span>
            <h3 className="mt-4 text-2xl sm:text-3xl font-semibold text-slate-900 leading-snug">
              Dari pemekaran wilayah menuju <span className="text-green-600">desa digital</span>
            </h3>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Desa Sukamaju berdiri sejak tahun 1980, bermula dari pemekaran wilayah yang bertujuan mempercepat pemerataan pembangunan di Kecamatan Pangandaran. Kini desa bertransformasi menjadi desa digital yang dekat dengan warganya.
            </p>
            <ol className="mt-8 space-y-5 border-l-2 border-green-100 pl-6">
              {SEJARAH.map((s) => (
                <li key={s.year} className="relative">
                  <span className="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-white border-4 border-green-500" />
                  <p className="text-sm font-bold text-green-700">{s.year}</p>
                  <p className="text-sm text-slate-600">{s.text}</p>
                </li>
              ))}
            </ol>
            <a href="#data" className="mt-8 inline-flex items-center text-sm font-semibold text-green-700 hover:text-green-800 group">
              Lihat data desa <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </a>
          </Reveal>
        </div>

        {/* Visi & Misi: teks kiri, gambar kanan */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal from="left" className="order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
              <Target className="w-4 h-4" /> Visi & Misi
            </span>
            <div className="relative mt-5 rounded-3xl bg-gradient-to-br from-[#14532d] to-[#166534] p-7 text-white overflow-hidden">
              <Quote className="absolute -top-2 -right-2 w-24 h-24 text-white/5" />
              <h4 className="font-semibold text-xs tracking-widest text-green-300">VISI</h4>
              <p className="relative mt-2 text-lg sm:text-xl font-semibold leading-relaxed">
                &ldquo;Terwujudnya Desa Sukamaju yang Bermartabat, Mandiri, dan Inovatif berbasis Teknologi.&rdquo;
              </p>
            </div>
            <h4 className="mt-8 font-semibold text-xs tracking-widest text-green-700">MISI</h4>
            <ol className="relative mt-5 space-y-4">
              <span className="absolute left-[1.65rem] top-8 bottom-8 w-px bg-gradient-to-b from-green-300 via-green-200 to-transparent" aria-hidden />
              {MISI.map((m, i) => (
                <li key={m.title} className="group relative flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200 overflow-hidden hover:border-green-300 hover:shadow-lg hover:shadow-green-900/5 hover:translate-x-1 transition-all duration-300">
                  <span className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-green-400 to-green-600 scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300" />
                  <span className="absolute -right-2 -top-3 text-6xl font-bold text-green-600/[0.07] select-none">0{i + 1}</span>
                  <span className="relative flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center shadow-lg shadow-green-600/25 group-hover:rotate-6 transition-transform">
                    <m.icon className="w-5 h-5" />
                  </span>
                  <div className="relative">
                    <h5 className="font-semibold text-slate-900">{m.title}</h5>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">{m.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal from="right" delay={150} className="order-1 lg:order-2">
            <div className="relative isolate mx-auto max-w-lg lg:max-w-none">
              <div className="absolute -top-4 -right-4 w-2/3 h-2/3 rounded-3xl bg-green-200/60 -z-10" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-3xl opacity-40 -z-10 [background-image:radial-gradient(#15803d_1.5px,transparent_1.5px)] [background-size:12px_12px]" />
              <div className="group overflow-hidden rounded-3xl shadow-2xl shadow-green-900/20 aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=900&q=80" alt="Pemandangan alam Desa Sukamaju" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="absolute -bottom-6 right-6 sm:right-10 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl">
                <div className="p-2.5 rounded-xl bg-green-600 text-white"><Users className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs text-slate-500">Melayani</p>
                  <p className="text-xl font-bold text-slate-900">10.374 jiwa</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Data Desa */}
      <section id="data" className="bg-white py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Data Desa</span>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Wilayah & Kependudukan</h2>
            <p className="text-slate-500 mt-2">Angka terkini yang membentuk wajah desa kita.</p>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 100} className="h-full">
                <div className="group relative overflow-hidden h-full p-6 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200 hover:bg-green-600 hover:border-green-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-900/15 transition-all duration-300">
                  <s.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-green-600/5 group-hover:text-white/10 transition-colors" />
                  <div className="w-11 h-11 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center group-hover:bg-white/15 group-hover:text-white transition-colors">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <p className="mt-5 text-3xl sm:text-4xl font-bold text-slate-900 group-hover:text-white transition-colors">
                    <CountUp to={s.to} decimals={s.decimals} />
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-green-100 transition-colors">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Infografis demografi */}
          <div className="grid lg:grid-cols-2 gap-5 mb-14">
            {/* Jenis kelamin */}
            <Reveal from="left" className="h-full">
              <div className="h-full flex flex-col p-7 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">Jenis Kelamin</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Komposisi penduduk</p>
                  </div>
                  <span className="p-2.5 rounded-xl bg-green-50 text-green-600"><Users className="w-5 h-5" /></span>
                </div>
                <div className="flex-1 mt-6 flex flex-col sm:flex-row items-center justify-center gap-8">
                  <div className="relative w-48 h-48 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90" aria-hidden>
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                      {GENDER.reduce<{ el: React.ReactNode[]; offset: number }>(
                        (acc, g) => {
                          const pct = (g.v / TOTAL_JIWA) * 100;
                          acc.el.push(
                            <circle key={g.l} cx="18" cy="18" r="15.9155" fill="none" stroke={g.color} strokeWidth="4" pathLength={100}
                              className="donut-seg" strokeDashoffset={-acc.offset} style={{ "--dash": pct } as React.CSSProperties} />
                          );
                          acc.offset += pct;
                          return acc;
                        },
                        { el: [], offset: 0 }
                      ).el}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-slate-900">{TOTAL_JIWA.toLocaleString("id-ID")}</span>
                      <span className="text-xs text-slate-400">Total jiwa</span>
                    </div>
                  </div>
                  <ul className="space-y-5 w-full sm:w-auto sm:min-w-[11rem]">
                    {GENDER.map((g) => (
                      <li key={g.l} className="flex items-center gap-4">
                        <span className="w-1.5 h-12 rounded-full" style={{ background: g.color }} />
                        <div>
                          <p className="text-xs text-slate-500">{g.l}</p>
                          <p className="text-2xl font-bold text-slate-900 leading-tight">
                            <CountUp to={g.v} /> <span className="text-xs font-semibold text-slate-400">{((g.v / TOTAL_JIWA) * 100).toFixed(1).replace(".", ",")}%</span>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-green-50 px-4 py-3">
                    <p className="text-xs text-green-700/70">Rasio L : P</p>
                    <p className="font-bold text-green-800">{((GENDER[0].v / GENDER[1].v) * 100).toFixed(1).replace(".", ",")} : 100</p>
                  </div>
                  <div className="rounded-2xl bg-green-50 px-4 py-3">
                    <p className="text-xs text-green-700/70">Rata-rata per KK</p>
                    <p className="font-bold text-green-800">{(TOTAL_JIWA / 3763).toFixed(1).replace(".", ",")} jiwa</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Kelompok usia */}
            <Reveal from="right" delay={120} className="h-full">
              <div className="h-full flex flex-col p-7 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">Kelompok Usia</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Sebaran usia penduduk</p>
                  </div>
                  <span className="p-2.5 rounded-xl bg-green-50 text-green-600"><TrendingUp className="w-5 h-5" /></span>
                </div>
                <ul className="flex-1 mt-6 flex flex-col justify-center gap-7">
                  {USIA.map((u) => {
                    const pct = (u.v / TOTAL_JIWA) * 100;
                    return (
                      <li key={u.l}>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm text-slate-600">{u.l}</span>
                          <span className="font-bold text-slate-900">{u.v.toLocaleString("id-ID")} <span className="text-xs font-semibold text-slate-400">· {Math.round(pct)}%</span></span>
                        </div>
                        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                          <div className="bar-fill h-full rounded-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-green-50 px-4 py-3">
                    <p className="text-xs text-green-700/70">Usia produktif</p>
                    <p className="font-bold text-green-800">{Math.round((USIA[1].v / TOTAL_JIWA) * 100)}% penduduk</p>
                  </div>
                  <div className="rounded-2xl bg-green-50 px-4 py-3">
                    <p className="text-xs text-green-700/70">Rasio ketergantungan</p>
                    <p className="font-bold text-green-800">{(((USIA[0].v + USIA[2].v) / USIA[1].v) * 100).toFixed(1).replace(".", ",")}%</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="text-center mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Lembaga Masyarakat yang Dibina</h3>
              <p className="text-slate-500 mt-1.5 text-sm">Mitra desa yang bergerak bersama warga di berbagai bidang.</p>
            </div>
            <div className="space-y-4 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
              {[false, true].map((rev) => {
                const list = rev ? [...LEMBAGA].reverse() : LEMBAGA;
                return (
                  <div key={String(rev)} className="overflow-hidden">
                    <div className={`flex w-max gap-4 ${rev ? "animate-marquee-reverse" : "animate-marquee"} hover:[animation-play-state:paused]`}>
                      {[...list, ...list].map((l, i) => (
                        <span key={i} className="group inline-flex items-center gap-3 pl-2 pr-6 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 text-sm font-semibold whitespace-nowrap cursor-default hover:bg-green-600 hover:border-green-600 hover:text-white hover:shadow-lg hover:shadow-green-600/25 transition-all duration-300">
                          <span className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-colors">
                            <l.icon className="w-4 h-4" />
                          </span>
                          {l.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Program Prioritas */}
      <section id="program" className="max-w-7xl mx-auto px-6 pt-4 pb-20 scroll-mt-24">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#052e16] via-[#14532d] to-[#166534] p-8 sm:p-12 text-white shadow-2xl shadow-green-950/20">
            <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-green-400/20 blur-3xl -z-10 animate-float-slow" />
            <div className="absolute -bottom-28 -right-16 w-96 h-96 rounded-full bg-green-300/10 blur-3xl -z-10 animate-float-slow [animation-delay:3s]" />
            <div className="absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="grid lg:grid-cols-5 gap-10 lg:gap-12 items-center">
              {/* Teks */}
              <div className="lg:col-span-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-green-200 uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" /> Program Prioritas
                </span>
                <h2 className="mt-5 text-3xl sm:text-4xl font-bold leading-tight">
                  Empat fokus kerja <span className="text-green-300">Desa Sukamaju</span> tahun ini
                </h2>
                <p className="mt-4 text-green-50/70 leading-relaxed">
                  Program yang kami kawal bersama warga, lengkap dengan capaian yang bisa dipantau secara terbuka.
                </p>
                <div className="mt-8 flex items-center gap-8">
                  <div>
                    <p className="text-4xl font-bold text-white"><CountUp to={4} /></p>
                    <p className="text-xs text-green-100/60 uppercase tracking-wider mt-1">Program Aktif</p>
                  </div>
                  <div className="w-px h-12 bg-white/15" />
                  <div>
                    <p className="text-4xl font-bold text-white"><CountUp to={84} />%</p>
                    <p className="text-xs text-green-100/60 uppercase tracking-wider mt-1">Rata-rata Capaian</p>
                  </div>
                </div>
              </div>

              {/* Kartu program */}
              <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
                {PROGRAM.map((p, i) => (
                  <Reveal key={p.title} delay={i * 100} from={i % 2 === 0 ? "left" : "right"} className="h-full">
                    <div className="group h-full p-6 rounded-3xl bg-white/[0.07] border border-white/10 backdrop-blur hover:bg-white/[0.14] hover:-translate-y-1.5 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-green-400/20 text-green-200 flex items-center justify-center group-hover:bg-green-400 group-hover:text-[#052e16] group-hover:rotate-6 transition-all duration-300">
                          <p.icon className="w-6 h-6" />
                        </div>
                        <span className="text-3xl font-bold text-white/15">0{i + 1}</span>
                      </div>
                      <h3 className="mt-4 font-semibold text-lg">{p.title}</h3>
                      <p className="mt-1.5 text-sm text-green-50/65 leading-relaxed">{p.desc}</p>
                      <div className="mt-5">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-green-100/60">Capaian</span>
                          <span className="font-semibold text-green-300">{p.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="bar-fill h-full rounded-full bg-gradient-to-r from-green-400 to-green-200" style={{ width: `${p.pct}%` }} />
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Potensi */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <Reveal className="text-center mb-16">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Pilar Ekonomi</span>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Potensi Unggulan Desa</h2>
          <p className="text-slate-500 mt-2 max-w-xl mx-auto">Tiga pilar yang menggerakkan ekonomi warga dan menjadi kebanggaan Desa Sukamaju.</p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {POTENSI.map((p, i) => (
            <Reveal key={p.title} delay={i * 120}>
              <div className="group">
                <div className="flex items-center gap-3 text-green-600">
                  <p.icon className="w-6 h-6 group-hover:-rotate-6 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.75} />
                  <span className="text-xs font-semibold tracking-widest text-slate-400">0{i + 1}</span>
                </div>
                <p className="mt-6 text-5xl lg:text-6xl font-bold text-slate-900 leading-none">
                  <CountUp to={p.to} />
                  <span className="text-green-600">{p.suffix}</span>
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-400">{p.unit}</p>

                <div className="mt-8 h-1 w-10 rounded-full bg-green-600 group-hover:w-20 transition-all duration-500" />

                <h3 className="mt-6 text-xl font-semibold text-slate-900">{p.title}</h3>
                <p className="mt-2 text-slate-500 leading-relaxed">{p.desc}</p>
                <p className="mt-5 text-sm font-medium text-green-700">
                  {p.items.join("  ·  ")}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Transparansi */}
      <section id="transparansi" className="bg-white py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal from="left">
            <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Transparansi</span>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Anggaran Desa 2026</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">Setiap rupiah dana desa dilaporkan secara berkala untuk kepentingan masyarakat. Kami menjunjung tinggi integritas dalam pelayanan.</p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="group p-5 rounded-2xl bg-gradient-to-br from-green-50 to-transparent border border-green-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-600/25 group-hover:rotate-6 transition-transform"><Wallet className="w-5 h-5" /></div>
                <p className="mt-4 text-xs font-semibold text-slate-500">Total Anggaran</p>
                <p className="text-2xl font-bold text-green-700">Rp 1,2 M</p>
              </div>
              <div className="group p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-transparent border border-sky-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-600/25 group-hover:rotate-6 transition-transform"><TrendingUp className="w-5 h-5" /></div>
                <p className="mt-4 text-xs font-semibold text-slate-500">Realisasi Dana</p>
                <p className="text-2xl font-bold text-sky-700">Rp 1,06 M</p>
              </div>
            </div>

            <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-600" /> Progres Fisik APBDes</span>
                <span className="font-bold text-slate-900"><CountUp to={88} />%</span>
              </div>
              <div className="mt-3 h-3 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-green-500 to-green-400" />
              </div>
              <p className="mt-2 text-xs text-slate-400">Diperbarui berkala oleh Pemerintah Desa</p>
            </div>
          </Reveal>

          <Reveal from="right" delay={150}>
            <div className="relative isolate overflow-hidden bg-gradient-to-br from-[#052e16] to-[#166534] p-7 sm:p-8 rounded-3xl text-white shadow-2xl shadow-green-900/20">
              <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-green-400/10 blur-2xl -z-10" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">Alokasi per Bidang</h3>
                  <p className="text-xs text-green-100/60 mt-0.5">Total belanja Rp 1,2 miliar</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-green-200">APBDes 2026</span>
              </div>

              {/* Bar tersegmentasi */}
              <div className="mt-6 flex h-3 gap-1 rounded-full overflow-hidden">
                {ANGGARAN.map((d, i) => (
                  <div key={d.l} className={`bar-fill h-full first:rounded-l-full last:rounded-r-full ${ANGGARAN_COLORS[i]}`} style={{ width: `${d.pct}%` }} />
                ))}
              </div>

              <ul className="mt-6 space-y-2">
                {ANGGARAN.map((d, i) => (
                  <li key={d.l} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors">
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${ANGGARAN_COLORS[i]}`} />
                    <span className="flex-1 text-sm">{d.l}</span>
                    <span className="text-xs font-mono text-green-100/70">{d.v}</span>
                    <span className="w-12 text-right text-sm font-bold text-green-300">{d.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Kabar Desa */}
      <section id="kabar" className="max-w-7xl mx-auto px-6 py-20 scroll-mt-20">
        <Reveal className="text-center mb-14">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Berita & Blog</span>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Kabar Desa Terbaru</h2>
          <p className="text-slate-500 mt-2 max-w-xl mx-auto">Kegiatan, pengumuman, dan cerita dari warga Desa Sukamaju.</p>
          <div className="w-16 h-1 bg-green-600 mt-4 rounded-full mx-auto" />
        </Reveal>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Berita utama */}
          <Reveal from="left" className="lg:col-span-3">
            <article className="group relative h-full min-h-[26rem] overflow-hidden rounded-3xl shadow-xl shadow-green-900/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BERITA[0].img} alt={BERITA[0].title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#052e16] via-[#052e16]/60 to-transparent" />
              <span className="absolute top-5 left-5 px-3 py-1 rounded-full bg-green-500 text-[#052e16] text-xs font-semibold">{BERITA[0].tag}</span>
              <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 text-white">
                <div className="flex items-center gap-3 text-xs text-green-100/80">
                  <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {BERITA[0].date}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {BERITA[0].read}</span>
                </div>
                <h3 className="mt-3 text-2xl sm:text-3xl font-semibold leading-snug">{BERITA[0].title}</h3>
                <p className="mt-3 text-sm text-green-50/80 leading-relaxed max-w-xl">{BERITA[0].excerpt}</p>
                <span className="mt-5 inline-flex items-center text-sm font-semibold text-green-300 group-hover:text-white">
                  Baca selengkapnya <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                </span>
              </div>
            </article>
          </Reveal>

          {/* Berita lainnya */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {BERITA.slice(1).map((b, i) => (
              <Reveal key={b.title} from="right" delay={i * 150} className="flex-1">
                <article className="group h-full flex flex-col sm:flex-row lg:flex-col xl:flex-row bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative sm:w-2/5 lg:w-full xl:w-2/5 h-44 sm:h-auto lg:h-40 xl:h-auto flex-shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.img} alt={b.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 text-green-700 text-xs font-semibold">{b.tag}</span>
                  </div>
                  <div className="flex-1 p-5 flex flex-col">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {b.date}</span>
                      <span>· {b.read}</span>
                    </div>
                    <h3 className="mt-2 font-semibold text-slate-900 leading-snug group-hover:text-green-700 transition-colors">{b.title}</h3>
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2">{b.excerpt}</p>
                    <span className="mt-auto pt-4 inline-flex items-center text-xs font-semibold text-green-700">
                      Baca selengkapnya <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-600 via-green-600 to-green-800 px-8 sm:px-12 py-14 text-white shadow-2xl shadow-green-700/25">
            <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_right,transparent,black_60%)]" />
            <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-white/10 blur-2xl -z-10 animate-float-slow" />
            <div className="absolute -bottom-32 left-1/4 w-80 h-80 rounded-full bg-green-300/20 blur-3xl -z-10 animate-float-slow [animation-delay:3s]" />

            <div className="grid lg:grid-cols-5 gap-10 items-center">
              <div className="lg:col-span-3 text-center lg:text-left">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-semibold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" /> Layanan Online
                </span>
                <h2 className="mt-5 text-3xl sm:text-4xl font-bold leading-tight">
                  Butuh layanan desa? <br className="hidden sm:block" />
                  <span className="text-green-200">Mulai dari sini.</span>
                </h2>
                <p className="mt-4 text-green-50/85 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Ajukan surat, sampaikan pengaduan, atau tanda tangani dokumen secara digital. Semua selesai dalam hitungan menit, tanpa antre.
                </p>
                <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                  <Link href="/layanan/surat/unduh" className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-green-700 rounded-full font-semibold shadow-xl shadow-green-900/20 hover:-translate-y-0.5 active:scale-95 transition-all">
                    Ajukan Surat <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/pengaduan" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 border border-white/30 backdrop-blur rounded-full font-semibold hover:bg-white/20 hover:-translate-y-0.5 active:scale-95 transition-all">
                    <Megaphone className="w-4 h-4" /> Buat Pengaduan
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-2 hidden lg:grid gap-4">
                {[
                  { icon: Clock, t: "Layanan 24 jam", d: "Ajukan kapan saja dari rumah", cls: "" },
                  { icon: FileCheck, t: "Rata-rata 1 hari", d: "Surat diproses dan siap unduh", cls: "ml-8" },
                  { icon: ShieldCheck, t: "Data terlindungi", d: "Aman dan tercatat resmi", cls: "" },
                ].map((f) => (
                  <div key={f.t} className={`flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/20 transition-colors ${f.cls}`}>
                    <span className="w-11 h-11 rounded-xl bg-white text-green-700 flex items-center justify-center flex-shrink-0"><f.icon className="w-5 h-5" /></span>
                    <div>
                      <p className="font-semibold">{f.t}</p>
                      <p className="text-xs text-green-50/75">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-slate-50 to-white pt-16 pb-8">

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr] gap-10 lg:gap-12 text-sm mb-12">
          <div>
            <a href="#beranda" className="inline-flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-green-500 to-green-700 p-2.5 rounded-xl shadow-lg shadow-green-600/30 group-hover:rotate-6 transition-transform">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <span className="block text-lg font-bold text-slate-900">SIDESA</span>
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest">Desa Sukamaju</span>
              </div>
            </a>
            <p className="mt-5 text-slate-500 leading-relaxed max-w-xs">Membangun desa melalui inovasi digital yang transparan dan inklusif.</p>
            <Link href="/login" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 active:scale-95 transition-all">
              Masuk Layanan <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-5 uppercase text-xs tracking-widest">Menu</h4>
            <ul className="space-y-3 text-slate-500">
              {NAV.map((n) => (
                <li key={n.label}>
                  <a href={n.href} className="group inline-flex items-center hover:text-green-700 transition-colors">
                    <span className="w-0 group-hover:w-3 h-px bg-green-600 mr-0 group-hover:mr-2 transition-all duration-300" />
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-5 uppercase text-xs tracking-widest">Kontak</h4>
            <ul className="space-y-4">
              <li>
                <a href="tel:+62851XXXXXXXX" className="group flex items-center gap-3 text-slate-600 hover:text-green-700 transition-colors">
                  <span className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors"><Phone className="w-4 h-4" /></span>
                  <span><span className="block text-xs text-slate-400">Telepon</span>0851-XXXX-XXXX</span>
                </a>
              </li>
              <li>
                <a href="mailto:admin@sukamaju.desa.id" className="group flex items-center gap-3 text-slate-600 hover:text-green-700 transition-colors">
                  <span className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors"><Mail className="w-4 h-4" /></span>
                  <span><span className="block text-xs text-slate-400">Email</span>admin@sukamaju.desa.id</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-5 uppercase text-xs tracking-widest">Lokasi</h4>
            <div className="flex gap-3">
              <span className="w-10 h-10 flex-shrink-0 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><MapPin className="w-4 h-4" /></span>
              <p className="text-slate-500 leading-relaxed">Jl. Raya Sukamaju No.100, Kecamatan Sukamaju, Kabupaten Pangandaran, Jawa Barat.</p>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-400"><Clock className="w-3.5 h-3.5" /> Senin - Jumat: 08.00 - 15.00 WIB</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-slate-200 text-xs text-slate-400 flex flex-col md:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} Pemerintah Desa Sukamaju. All rights reserved.</p>
          <p>Dibuat dengan <span className="text-green-600">❤</span> untuk kemajuan desa</p>
        </div>
      </footer>
    </div>
  );
}
