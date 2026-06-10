"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, MapPin, Clock, ArrowRight, Phone, Mail, Newspaper, Users, BarChart3, ChevronRight, FileCheck, Landmark, Megaphone, UserCircle, BookOpenText, Target } from "lucide-react";

export default function LandingPage() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const formatted = now.toLocaleString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).replace(/\./g, ":");
      setCurrentTime(formatted);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Top Bar */}
      <div className="bg-[#0f172a] text-slate-300 py-3 px-6 text-[16px] flex justify-between items-center border-b border-emerald-900">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Desa Sukamaju - Kecamatan Pangandaran</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Senin - Jum'at: 08.00 - 15.00 WIB</span>
        </div>
        <div className="font-mono font-medium text-md">{currentTime || "Memuat waktu..."}</div>
      </div>

      {/* 2. Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-emerald-600 p-1.5 rounded-lg"><Building2 className="w-5 h-5 text-white" /></div>
             <span className="font-bold text-slate-900 text-lg tracking-tight">DESA SUKAMAJU</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
            {['Beranda', 'Profil', 'Layanan', 'APBDesa', 'Galeri'].map(m => <Link key={m} href="#" className="hover:text-emerald-700 transition">{m}</Link>)}
          </div>
          <Link href="/dashboard" className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition">Dashboard</Link>
        </div>
      </nav>

      {/* 3. Hero */}
      <section className="bg-[#0f172a] text-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6 tracking-tight">SUKAMAJU BERMARTABAT</h1>
          <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg">Pusat pelayanan digital terintegrasi untuk mewujudkan tata kelola desa yang transparan, efektif, dan efisien.</p>
          <div className="flex justify-center gap-4">
              <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition">Ajukan Layanan</button>
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition">Lihat Info Desa</button>
          </div>
        </div>
      </section>

      {/* 4. Quick Services (New) */}
      <section className="max-w-7xl mx-auto px-6 -mt-12">
        <div className="grid md:grid-cols-4 gap-4">
            {[
                { title: "Surat Online", icon: FileCheck },
                { title: "Pengaduan", icon: Megaphone },
                { title: "Profil Perangkat", icon: UserCircle },
                { title: "Bantuan Sosial", icon: Landmark },
            ].map((s, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                    <div className="p-3 bg-slate-100 rounded-lg text-emerald-700"><s.icon className="w-5 h-5" /></div>
                    <span className="font-bold text-sm text-slate-700">{s.title}</span>
                </div>
            ))}
        </div>
      </section>

      {/* 3b. Profil & Identitas Desa (New Section) */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12">
            {/* Visi Misi */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Target className="text-emerald-600" /> Visi & Misi
                </h2>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-bold text-sm text-emerald-700">VISI</h4>
                        <p className="text-sm text-slate-600 italic">"Terwujudnya Desa Sukamaju yang Bermartabat, Mandiri, dan Inovatif berbasis Teknologi."</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-emerald-700">MISI</h4>
                        <ul className="text-sm text-slate-600 space-y-2 list-decimal ml-4">
                            <li>Meningkatkan kualitas pelayanan publik berbasis digital.</li>
                            <li>Mengembangkan potensi ekonomi lokal melalui UMKM.</li>
                            <li>Meningkatkan transparansi tata kelola pemerintahan desa.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Sejarah Singkat */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <BookOpenText className="text-emerald-600" /> Sejarah Desa
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Desa Sukamaju berdiri sejak tahun 1980, bermula dari pemekaran wilayah yang bertujuan untuk mempercepat pemerataan pembangunan di wilayah Kecamatan Pangandaran.
                </p>
                <button className="text-emerald-700 font-bold text-xs flex items-center hover:underline">
                    Baca Sejarah Lengkap <ChevronRight className="w-3 h-3 ml-1" />
                </button>
            </div>
        </div>
      </section>

      {/* 5. Berita & Kegiatan */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Kabar Desa Terbaru</h2>
        <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map((i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition">
                    <img src="https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=600&q=80" className="w-full h-48 object-cover" alt="Kegiatan" />
                    <div className="p-6">
                        <h3 className="font-bold text-slate-900 text-lg mb-2">Gotong Royong Kebersihan Lingkungan Desa Sukamaju</h3>
                        <p className="text-sm text-slate-500 mb-4">Kegiatan rutin bulanan warga Desa Sukamaju dalam menjaga kebersihan lingkungan...</p>
                        <Link href="#" className="text-emerald-700 font-bold text-xs flex items-center">Baca Selengkapnya <ChevronRight className="w-3 h-3 ml-1" /></Link>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* 5b. Potensi Desa (New) */}
     <section className="max-w-7xl mx-auto px-6 pb-20">
      <div className="flex flex-col items-center mb-12">
        <span className="text-[13px] font-bold text-emerald-600 uppercase mb-2">Pilar Ekonomi</span>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Potensi Unggulan Desa</h2>
        <div className="w-16 h-1 bg-emerald-600 mt-4 rounded-full"></div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { 
            title: "UMKM Lokal", 
            desc: "Mendorong kemandirian ekonomi melalui produk kerajinan tangan dan olahan khas warga Sukamaju.", 
            icon: Landmark,
            color: "bg-blue-50 text-blue-700" 
          },
          { 
            title: "Wisata Alam", 
            desc: "Pengembangan kawasan agrowisata yang menawarkan pemandangan asri dan edukasi lingkungan.", 
            icon: Building2,
            color: "bg-emerald-50 text-emerald-700" 
          },
          { 
            title: "Hasil Bumi", 
            desc: "Pengelolaan komoditas pertanian unggulan desa dengan standar kualitas distribusi modern.", 
            icon: Newspaper,
            color: "bg-amber-50 text-amber-700" 
          },
        ].map((p, i) => (
          <div 
            key={i} 
            className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className={`w-14 h-14 ${p.color} rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 group-hover:scale-110`}>
              <p.icon className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-3">{p.title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">{p.desc}</p>
            <div className="flex items-center text-emerald-700 font-bold text-xs uppercase r opacity-0 group-hover:opacity-100 transition-opacity">
              Lihat Detail <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ))}
      </div>
    </section>

<section className="py-20 bg-slate-50 border-y border-slate-200">
  <div className="max-w-7xl mx-auto px-6">
    {/* Header Section */}
    <div className="text-center mb-16">
      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <MapPin className="w-6 h-6" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900">Wilayah & Kelembagaan</h2>
      <p className="text-slate-500 mt-2">Data demografi dan lembaga masyarakat yang aktif di Desa Babakan.</p>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
      {[
        { val: "3", label: "Dusun" },
        { val: "3.763", label: "Kepala Keluarga" },
        { val: "10.374", label: "Jumlah Jiwa" },
        { val: "667,87", label: "Luas (Ha)" },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-emerald-100 hover:border-emerald-200 transition-all duration-300 group">
          <p className="text-4xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{stat.val}</p>
          <p className="text-xs font-bold text-slate-400 uppercase st mt-2">{stat.label}</p>
        </div>
      ))}
    </div>

    {/* Lembaga Cards */}
    <div className="bg-[#0f172a] rounded-[2rem] p-10 text-center">
      <h3 className="text-white font-bold text-xl mb-8">Lembaga Masyarakat yang Dibina</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {[
          "BPD", "LPM", "Karang Taruna", "Kader Posyandu", "MUI Desa", "Satlinmas", "PKK", "Gapoktan"
        ].map((lembaga) => (
          <span 
            key={lembaga} 
            className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-emerald-600 hover:border-emerald-600 transition-all cursor-default"
          >
            {lembaga}
          </span>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* 5c. Statistik Kependudukan (New) */}
      <section className="bg-slate-900 py-16 text-white">
        <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-8">Data Kependudukan</h2>
            <div className="grid md:grid-cols-4 gap-6">
                {[
                    { label: "Total Jiwa", val: "2.480" },
                    { label: "Kepala Keluarga", val: "720" },
                    { label: "Pria", val: "1.230" },
                    { label: "Wanita", val: "1.250" },
                ].map((stat, i) => (
                    <div key={i} className="border border-slate-700 p-6 rounded-xl bg-slate-800/50">
                        <p className="text-[10px] uppercase text-emerald-400 font-bold ">{stat.label}</p>
                        <p className="text-3xl font-bold mt-2 font-mono">{stat.val}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* 6. Statistik & Transparansi */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Transparansi Anggaran 2026</h2>
                <p className="text-slate-600 text-sm mb-8">Setiap rupiah dana desa dilaporkan secara berkala untuk kepentingan masyarakat. Kami menjunjung tinggi integritas dalam pelayanan.</p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="border p-4 rounded-lg"><p className="text-[10px] text-slate-400">Total Anggaran</p><p className="font-bold text-emerald-700">Rp 1.2 M</p></div>
                    <div className="border p-4 rounded-lg"><p className="text-[10px] text-slate-400">Progres Fisik</p><p className="font-bold text-slate-900">88%</p></div>
                </div>
            </div>
            <div className="bg-slate-900 p-8 rounded-2xl text-white">
                <h3 className="font-bold mb-6">Demografi Warga</h3>
                <div className="space-y-4">
                    {['Laki-laki (620)', 'Perempuan (620)', 'Usia Produktif (800)'].map(label => (
                        <div key={label} className="flex justify-between text-sm border-b border-slate-700 pb-2">
                            <span>{label}</span>
                            <span className="font-mono text-emerald-400">●●●●●●</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Untuk Siapa Website Ini?</h2>
          <p className="text-slate-500">Mendekatkan informasi dan layanan kepada semua pihak.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Warga Desa", desc: "Mengakses layanan dan informasi lebih mudah.", icon: Users },
            { title: "Wisatawan", desc: "Mengenal desa dan berinteraksi lebih dekat.", icon: MapPin },
            { title: "Mitra Usaha", desc: "Melihat potensi kerja sama dengan desa.", icon: Building2 },
            { title: "Akademisi", desc: "Sebagai sumber data dan dokumentasi resmi.", icon: BookOpenText },
            { title: "Diaspora", desc: "Tetap terhubung dengan tanah kelahiran.", icon: Landmark },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600 flex-shrink-0">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg mb-1">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#0b1a20] text-slate-300 p-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-sm mb-12">
        <div className="space-y-4">
          <h4 className="font-bold text-white text-lg ">DESA SUKAMAJU</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            "DESA Sukamaju BERMARTABAT". Membangun desa melalui inovasi digital yang transparan dan inklusif.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-6 uppercase text-xs">Menu Navigasi</h4>
          <ul className="space-y-3 text-slate-400">
            {['Beranda', 'Profil', 'Layanan', 'Data'].map(i => (
              <li key={i} className="hover:text-emerald-400 hover:translate-x-1 transition-all duration-300 cursor-pointer">
                {i}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-white mb-6 uppercase text-xs">Kontak Kami</h4>
          <a href="tel:+62851XXXXXXXX" className="flex items-center gap-3 hover:text-white transition-colors">
            <Phone className="w-4 h-4 text-emerald-500" /> 0851-XXXX-XXXX
          </a>
          <a href="mailto:admin@Sukamaju.desa.id" className="flex items-center gap-3 hover:text-white transition-colors">
            <Mail className="w-4 h-4 text-emerald-500" /> admin@Sukamaju.desa.id
          </a>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-white mb-6 uppercase text-xs">Lokasi Desa</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            Jl. Raya Sukamaju No.100, Kecamatan Sukamaju, Kabupaten Pangandaran, Jawa Barat.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Pemerintah Desa Sukamaju. All rights reserved.
        </p>
        <div className="text-xs text-slate-500">
          Dibuat dengan ❤️ untuk kemajuan desa
        </div>
      </div>
    </footer>
    </div>
  );
}