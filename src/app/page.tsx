"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2, MapPin, Clock, ArrowRight, Phone, Mail, Users, ChevronRight, FileCheck,
  Landmark, Megaphone, UserCircle, BookOpenText, Target, Menu, X, ShieldCheck,
  Sprout, Store, Mountain, Star, Wallet, TrendingUp, Home, Sparkles,
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
  { title: "Surat Online", desc: "Ajukan & unduh surat keterangan tanpa antre.", icon: FileCheck, href: "/layanan/surat/unduh", color: "from-emerald-500 to-teal-500" },
  { title: "Pengaduan Warga", desc: "Sampaikan keluhan, pantau tindak lanjutnya.", icon: Megaphone, href: "/pengaduan", color: "from-amber-500 to-orange-500" },
  { title: "Survey Kepuasan", desc: "Nilai layanan agar desa makin baik.", icon: Star, href: "/survey-kepuasan", color: "from-sky-500 to-blue-500" },
  { title: "Bantuan Sosial", desc: "Informasi penerima dan penyaluran bansos.", icon: Landmark, href: "/dashboard", color: "from-violet-500 to-fuchsia-500" },
];

const STATS = [
  { to: 3, label: "Dusun", icon: Home, decimals: 0 },
  { to: 3763, label: "Kepala Keluarga", icon: Users, decimals: 0 },
  { to: 10374, label: "Jumlah Jiwa", icon: UserCircle, decimals: 0 },
  { to: 667.87, label: "Luas Wilayah (Ha)", icon: Mountain, decimals: 2 },
];

const POTENSI = [
  { title: "UMKM Lokal", desc: "Kemandirian ekonomi lewat kerajinan tangan dan olahan khas warga.", icon: Store, color: "bg-blue-50 text-blue-700" },
  { title: "Wisata Alam", desc: "Kawasan agrowisata dengan pemandangan asri dan edukasi lingkungan.", icon: Mountain, color: "bg-emerald-50 text-emerald-700" },
  { title: "Hasil Bumi", desc: "Komoditas pertanian unggulan dengan standar distribusi modern.", icon: Sprout, color: "bg-amber-50 text-amber-700" },
];

const LEMBAGA = ["BPD", "LPM", "Karang Taruna", "Kader Posyandu", "MUI Desa", "Satlinmas", "PKK", "Gapoktan"];

const BERITA = [
  { tag: "Lingkungan", title: "Gotong Royong Kebersihan Lingkungan Desa", date: "12 Okt 2026" },
  { tag: "Layanan", title: "Layanan Surat Online Kini Tersedia 24 Jam", date: "5 Okt 2026" },
  { tag: "Pembangunan", title: "Progres Pembangunan Jalan Usaha Tani Capai 88%", date: "28 Sep 2026" },
];

export default function LandingPage() {
  const [currentTime, setCurrentTime] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const tick = () =>
      setCurrentTime(
        new Date()
          .toLocaleString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })
          .replace(/\./g, ":")
      );
    tick();
    const timer = setInterval(tick, 1000);
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden">
      {/* Top Bar */}
      <div className="hidden md:flex bg-[#062a24] text-emerald-100/80 py-2 px-6 text-xs justify-between items-center">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Desa Sukamaju, Kec. Pangandaran</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Senin - Jumat: 08.00 - 15.00 WIB</span>
        </div>
        <div className="font-mono">{currentTime || "Memuat waktu..."}</div>
      </div>

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/70" : "bg-white border-b border-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#beranda" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-lg shadow-emerald-600/30 group-hover:rotate-6 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="block font-bold text-slate-900 tracking-tight">SIDESA</span>
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest">Desa Sukamaju</span>
            </div>
          </a>
          <div className="hidden lg:flex gap-1 text-sm font-semibold text-slate-600">
            {NAV.map((m) => (
              <a key={m.label} href={m.href} className="px-3 py-2 rounded-lg hover:text-emerald-700 hover:bg-emerald-50 transition-colors">{m.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 active:scale-95 transition-all">
              Masuk <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className={`lg:hidden grid transition-all duration-300 ${menuOpen ? "grid-rows-[1fr] border-t border-slate-100" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden bg-white">
            <div className="px-6 py-3 flex flex-col">
              {NAV.map((m) => (
                <a key={m.label} href={m.href} onClick={() => setMenuOpen(false)} className="py-3 text-sm font-semibold text-slate-700 hover:text-emerald-700">{m.label}</a>
              ))}
              <Link href="/login" className="mt-2 mb-2 text-center px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl">Masuk</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header id="beranda" className="relative isolate overflow-hidden bg-gradient-to-br from-[#04201b] via-[#07372f] to-[#0b4f43] text-white">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-emerald-400/20 blur-3xl animate-float-slow" />
        <div className="absolute top-40 -right-24 w-[26rem] h-[26rem] rounded-full bg-teal-300/20 blur-3xl animate-float-slow [animation-delay:3s]" />
        <div className="absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-44 lg:pt-28 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="animate-fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-emerald-200 backdrop-blur">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring" />
                <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
              </span>
              Sistem Informasi Desa Digital
            </span>
            <h1 className="animate-fade-up [animation-delay:120ms] mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Desa Sukamaju <br />
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-lime-200 bg-clip-text text-transparent">Bermartabat & Digital</span>
            </h1>
            <p className="animate-fade-up [animation-delay:240ms] mt-6 text-lg text-emerald-50/70 max-w-xl leading-relaxed">
              Satu pintu layanan administrasi, pengaduan, dan informasi desa. Transparan, cepat, dan bisa diakses kapan saja dari rumah.
            </p>
            <div className="animate-fade-up [animation-delay:360ms] mt-9 flex flex-wrap gap-4">
              <a href="#layanan" className="group inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-[#04201b] rounded-xl font-bold shadow-xl shadow-emerald-500/25 hover:-translate-y-0.5 active:scale-95 transition-all">
                Ajukan Layanan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#profil" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl font-bold backdrop-blur hover:-translate-y-0.5 active:scale-95 transition-all">
                Kenali Desa Kami
              </a>
            </div>
            <div className="animate-fade-up [animation-delay:480ms] mt-10 flex items-center gap-6 text-sm text-emerald-100/70">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-300" /> Data aman</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-300" /> Layanan 24 jam</span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:block animate-fade-up [animation-delay:300ms]">
            <div className="relative mx-auto w-full max-w-md animate-float-slow">
              <div className="rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-bold">Ringkasan Desa</span>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { l: "Penduduk", v: "10.374" },
                    { l: "Keluarga", v: "3.763" },
                    { l: "Surat Selesai", v: "1.248" },
                    { l: "Kepuasan", v: "4,8/5" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-2xl bg-white/10 p-4">
                      <p className="text-[11px] uppercase tracking-wider text-emerald-200/70">{s.l}</p>
                      <p className="text-2xl font-bold mt-1">{s.v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl bg-white/10 p-4">
                  <div className="flex justify-between text-xs text-emerald-100/80 mb-2"><span>Progres Fisik APBDes</span><span>88%</span></div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-[88%] rounded-full bg-gradient-to-r from-emerald-400 to-lime-300" /></div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-8 flex items-center gap-3 rounded-2xl bg-white text-slate-800 px-4 py-3 shadow-xl">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700"><FileCheck className="w-5 h-5" /></div>
                <div><p className="text-xs text-slate-500">Surat diproses</p><p className="text-sm font-bold">Rata-rata 1 hari</p></div>
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
              <Link href={s.href} className="group block h-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-2 transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="mt-5 font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                <span className="mt-4 inline-flex items-center text-xs font-bold text-emerald-700">
                  Buka layanan <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1.5 transition-transform" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Profil */}
      <section id="profil" className="max-w-7xl mx-auto px-6 pb-20 scroll-mt-20">
        <Reveal className="text-center mb-12">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Profil Desa</span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">Mengenal Desa Sukamaju</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-8">
          <Reveal className="h-full">
            <div className="h-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700"><Target className="w-5 h-5" /></span> Visi & Misi
              </h3>
              <h4 className="font-bold text-xs tracking-widest text-emerald-700">VISI</h4>
              <p className="text-slate-600 italic mt-1 mb-5">&ldquo;Terwujudnya Desa Sukamaju yang Bermartabat, Mandiri, dan Inovatif berbasis Teknologi.&rdquo;</p>
              <h4 className="font-bold text-xs tracking-widest text-emerald-700">MISI</h4>
              <ul className="mt-2 space-y-3">
                {["Meningkatkan kualitas pelayanan publik berbasis digital.", "Mengembangkan potensi ekonomi lokal melalui UMKM.", "Meningkatkan transparansi tata kelola pemerintahan desa."].map((m, i) => (
                  <li key={m} className="flex gap-3 text-sm text-slate-600">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>{m}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={150} className="h-full">
            <div className="h-full bg-gradient-to-br from-[#07372f] to-[#0b4f43] p-8 rounded-3xl text-white shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="p-2 rounded-xl bg-white/10 text-emerald-300"><BookOpenText className="w-5 h-5" /></span> Sejarah Desa
              </h3>
              <p className="text-emerald-50/80 leading-relaxed">
                Desa Sukamaju berdiri sejak tahun 1980, bermula dari pemekaran wilayah yang bertujuan mempercepat pemerataan pembangunan di Kecamatan Pangandaran. Kini desa bertransformasi menjadi desa digital yang dekat dengan warganya.
              </p>
              <a href="#data" className="mt-6 inline-flex items-center text-sm font-bold text-emerald-300 hover:text-white group">
                Lihat data desa <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Data Desa */}
      <section id="data" className="bg-white border-y border-slate-200 py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Data Desa</span>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">Wilayah & Kependudukan</h2>
            <p className="text-slate-500 mt-2">Angka terkini yang membentuk wajah desa kita.</p>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 100} className="h-full">
                <div className="group h-full p-7 rounded-3xl bg-slate-50 border border-slate-200 hover:bg-emerald-600 hover:border-emerald-600 hover:-translate-y-1 transition-all duration-300">
                  <s.icon className="w-6 h-6 text-emerald-600 group-hover:text-emerald-200 transition-colors" />
                  <p className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 group-hover:text-white transition-colors">
                    <CountUp to={s.to} decimals={s.decimals} />
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-100 transition-colors">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="bg-[#062a24] rounded-[2rem] py-10 overflow-hidden">
              <h3 className="text-white font-bold text-xl text-center mb-8">Lembaga Masyarakat yang Dibina</h3>
              <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <div className="flex w-max gap-3 animate-marquee hover:[animation-play-state:paused]">
                  {[...LEMBAGA, ...LEMBAGA].map((l, i) => (
                    <span key={i} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-emerald-600 hover:border-emerald-600 transition-colors cursor-default whitespace-nowrap">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Potensi */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <Reveal className="text-center mb-12">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Pilar Ekonomi</span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">Potensi Unggulan Desa</h2>
          <div className="w-16 h-1 bg-emerald-600 mt-4 rounded-full mx-auto" />
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8">
          {POTENSI.map((p, i) => (
            <Reveal key={p.title} delay={i * 120} className="h-full">
              <div className="group h-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 hover:-translate-y-2 transition-all duration-300">
                <div className={`w-14 h-14 ${p.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                  <p.icon className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-3">{p.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Transparansi */}
      <section id="transparansi" className="bg-white border-y border-slate-200 py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Transparansi</span>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">Anggaran Desa 2026</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">Setiap rupiah dana desa dilaporkan secara berkala untuk kepentingan masyarakat. Kami menjunjung tinggi integritas dalam pelayanan.</p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <p className="mt-3 text-xs text-slate-400">Total Anggaran</p>
                <p className="text-2xl font-extrabold text-emerald-700">Rp 1,2 M</p>
              </div>
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <p className="mt-3 text-xs text-slate-400">Progres Fisik</p>
                <p className="text-2xl font-extrabold text-slate-900"><CountUp to={88} />%</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="bg-[#062a24] p-8 rounded-3xl text-white">
              <h3 className="font-bold mb-6">Demografi Warga</h3>
              <div className="space-y-5">
                {[
                  { l: "Laki-laki", v: 620, pct: 50 },
                  { l: "Perempuan", v: 620, pct: 50 },
                  { l: "Usia Produktif", v: 800, pct: 64 },
                ].map((d) => (
                  <div key={d.l}>
                    <div className="flex justify-between text-sm mb-1.5"><span>{d.l}</span><span className="font-mono text-emerald-300">{d.v}</span></div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300" style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Kabar Desa */}
      <section id="kabar" className="max-w-7xl mx-auto px-6 py-20 scroll-mt-20">
        <Reveal className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Berita</span>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">Kabar Desa Terbaru</h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {BERITA.map((b, i) => (
            <Reveal key={b.title} delay={i * 120} className="h-full">
              <article className="group h-full bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=600&q=80" alt={b.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 text-emerald-700 text-xs font-bold">{b.tag}</span>
                </div>
                <div className="p-6">
                  <p className="text-xs text-slate-400 mb-2">{b.date}</p>
                  <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-emerald-700 transition-colors">{b.title}</h3>
                  <span className="mt-4 inline-flex items-center text-xs font-bold text-emerald-700">
                    Baca selengkapnya <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-14 text-center text-white">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 animate-float-slow" />
            <h2 className="relative text-3xl font-bold">Butuh layanan desa? Mulai dari sini.</h2>
            <p className="relative mt-3 text-emerald-50/90">Ajukan surat, sampaikan pengaduan, atau beri penilaian layanan dalam hitungan menit.</p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/layanan/surat/unduh" className="px-6 py-3 bg-white text-emerald-700 rounded-xl font-bold hover:-translate-y-0.5 hover:shadow-xl active:scale-95 transition-all">Ajukan Surat</Link>
              <Link href="/pengaduan" className="px-6 py-3 bg-emerald-800/50 border border-white/20 rounded-xl font-bold hover:bg-emerald-800/70 hover:-translate-y-0.5 active:scale-95 transition-all">Buat Pengaduan</Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="bg-[#04201b] text-slate-300 pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-sm mb-12">
          <div className="space-y-4">
            <h4 className="font-bold text-white text-lg">DESA SUKAMAJU</h4>
            <p className="text-slate-400 leading-relaxed">Membangun desa melalui inovasi digital yang transparan dan inklusif.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-5 uppercase text-xs tracking-widest">Menu</h4>
            <ul className="space-y-3 text-slate-400">
              {NAV.map((n) => (
                <li key={n.label}><a href={n.href} className="inline-block hover:text-emerald-400 hover:translate-x-1 transition-all duration-300">{n.label}</a></li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-white mb-5 uppercase text-xs tracking-widest">Kontak</h4>
            <a href="tel:+62851XXXXXXXX" className="flex items-center gap-3 hover:text-white transition-colors"><Phone className="w-4 h-4 text-emerald-500" /> 0851-XXXX-XXXX</a>
            <a href="mailto:admin@sukamaju.desa.id" className="flex items-center gap-3 hover:text-white transition-colors"><Mail className="w-4 h-4 text-emerald-500" /> admin@sukamaju.desa.id</a>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-5 uppercase text-xs tracking-widest">Lokasi</h4>
            <p className="text-slate-400 leading-relaxed">Jl. Raya Sukamaju No.100, Kecamatan Sukamaju, Kabupaten Pangandaran, Jawa Barat.</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} Pemerintah Desa Sukamaju. All rights reserved.</p>
          <p>Dibuat dengan ❤️ untuk kemajuan desa</p>
        </div>
      </footer>
    </div>
  );
}
