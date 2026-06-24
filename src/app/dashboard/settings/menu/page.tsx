"use client";

import { useState } from "react";
import Button from "@components/ui/Button";
import { Save, GripVertical, Eye, EyeOff } from "lucide-react";

export default function MenuSettingsPage() {
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: "Dashboard", enabled: true },
    { id: 2, name: "Data Keluarga", enabled: true },
    { id: 3, name: "Data Kegiatan", enabled: true },
    { id: 4, name: "Bantuan Sosial", enabled: true },
    { id: 5, name: "Surat Administrasi", enabled: true },
    { id: 6, name: "Retribusi", enabled: true },
    { id: 7, name: "Pengaduan", enabled: false },
    { id: 8, name: "Survey Kepuasan", enabled: true },
  ]);

  const toggleMenu = (id: number) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Menu</h1>
          <p className="text-sm text-slate-500 mt-1">Aktifkan atau nonaktifkan menu yang tampil di sidebar.</p>
        </div>
        <Button leftIcon={<Save className="w-4 h-4" />} className="!cursor-pointer">
          Simpan Urutan
        </Button>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
        <p className="text-xs text-blue-700">
          <strong>Catatan:</strong> Menu yang dinonaktifkan akan disembunyikan dari sidebar untuk semua pengguna, kecuali akun Administrator.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {menuItems.map((item) => (
            <li key={item.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-slate-300 cursor-grab" />
                <span className={`font-medium ${item.enabled ? 'text-slate-800' : 'text-slate-400'}`}>
                  {item.name}
                </span>
              </div>
              
              <button 
                onClick={() => toggleMenu(item.id)}
                className={`p-2 rounded-lg transition-colors ${item.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
              >
                {item.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}