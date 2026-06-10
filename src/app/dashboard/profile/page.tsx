"use client";

import React, { useState } from 'react';
import { User, Mail, Shield, Building2, Lock, Edit3, X } from 'lucide-react';

export default function ProfilePage() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const profile = {
    nama: "Nama Petugas",
    email: "petugas@desa.id",
    role: "Admin Desa",
    jabatan: "Sekretaris Desa",
    instansi: "Kantor Desa Sukamaju",
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Profil Pengguna</h1>
          <p className="text-slate-500 text-sm">Kelola informasi akun dan pengaturan akses sistem.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded hover:bg-slate-800 transition">
          <Edit3 className="w-4 h-4" />
          Edit Profil
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Informasi Utama</span>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
                <User className="w-12 h-12" />
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {[
                { label: "Nama lengkap", value: profile.nama, icon: User },
                { label: "Email", value: profile.email, icon: Mail },
                { label: "Jabatan", value: profile.jabatan, icon: Shield },
                { label: "Instansi", value: profile.instansi, icon: Building2 },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                    <item.icon className="w-3 h-3" />
                    {item.label}
                  </label>
                  <p className="text-sm font-medium text-slate-900 p-2 bg-slate-50 border border-slate-100 rounded">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pengaturan Keamanan</span>
          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-800 uppercase tracking-wider transition"
          >
            <Lock className="w-3 h-3" />
            Ubah Kata Sandi
          </button>
        </div>
      </div>

      {/* MODAL UBAH PASSWORD */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Ubah Kata Sandi</h3>
              <button onClick={() => setIsPasswordModalOpen(false)}><X className="w-4 h-4 text-slate-400"/></button>
            </div>
            <div className="space-y-3">
              <input type="password" placeholder="Kata sandi lama" className="w-full p-2 border rounded text-sm" />
              <input type="password" placeholder="Kata sandi baru" className="w-full p-2 border rounded text-sm" />
              <input type="password" placeholder="Konfirmasi kata sandi" className="w-full p-2 border rounded text-sm" />
            </div>
            <button className="w-full py-2 bg-slate-900 text-white text-sm font-semibold rounded hover:bg-slate-800">
              Simpan Perubahan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}