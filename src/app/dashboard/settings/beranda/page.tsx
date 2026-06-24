"use client";

import { useState } from "react";
import Input from "@components/ui/Input";
import Textarea from "@components/ui/Textarea";
import Button from "@components/ui/Button";
import FileUpload, { UploadedFile } from "@components/ui/FileUpload"; // Import komponen FileUpload
import { Save, Plus, Trash2, Image as ImageIcon, Target, BookOpenText } from "lucide-react";

export default function BerandaSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [misi, setMisi] = useState(["", ""]);
  // State untuk file banner
  const [bannerFile, setBannerFile] = useState<UploadedFile[]>([]);

  const addMisi = () => setMisi([...misi, ""]);
  const removeMisi = (index: number) => setMisi(misi.filter((_, i) => i !== index));
  const updateMisi = (index: number, value: string) => {
    const newMisi = [...misi];
    newMisi[index] = value;
    setMisi(newMisi);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Saving...", { bannerFile }); // bannerFile akan berisi data gambar yang diunggah
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Aplikasi</h1>
          <p className="text-sm text-slate-500 mt-1">Pusat manajemen konten dan informasi resmi desa.</p>
        </div>
        <Button 
          type="submit" 
          form="settings-form" // Pastikan form punya id agar button di luar form bisa submit
          loading={loading}
          leftIcon={<Save className="w-4 h-4" />}
          className="!cursor-pointer"
        >
          Simpan Perubahan
        </Button>
      </div>

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
        
        {/* HERO SECTION DENGAN FILE UPLOAD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 text-emerald-700">
            <ImageIcon className="w-5 h-5" />
            <h2 className="font-bold">Hero Section</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Judul Utama" placeholder="Contoh: Selamat Datang di Desa Sukajadi" />
            <Input label="Sub-Judul" placeholder="Pelayanan masyarakat lebih mudah..." />
          </div>
          <Textarea label="Deskripsi Hero" rows={3} />
          
          {/* File Upload untuk Banner */}
          <div className="pt-2">
            <FileUpload
              label="Banner Hero Utama"
              helperText="Format: JPG/PNG, Maksimal 2MB"
              files={bannerFile}
              onChange={setBannerFile}
              maxFiles={1} // Hero biasanya cuma satu gambar
              maxSizeMB={2}
              accept="image/*"
            />
          </div>
        </div>

        {/* SECTION 2: VISI & MISI */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 text-emerald-700">
            <Target className="w-5 h-5" />
            <h2 className="font-bold">Visi dan Misi</h2>
          </div>
          <Textarea label="Visi Desa" rows={3} placeholder="Tuliskan visi besar desa..." />
          
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Misi Desa</label>
            {misi.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input 
                  className="flex-1"
                  placeholder={`Poin misi ke-${index + 1}`}
                  value={item}
                  onChange={(e) => updateMisi(index, e.target.value)}
                />
                <Button 
                  type="button" 
                  variant="danger" 
                  size="icon" 
                  onClick={() => removeMisi(index)}
                  className="!cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button 
              type="button" 
              variant="secondary" 
              size="sm" 
              onClick={addMisi}
              leftIcon={<Plus className="w-4 h-4" />}
              className="!cursor-pointer"
            >
              Tambah Misi
            </Button>
          </div>
        </div>

        {/* SECTION 3: SEJARAH */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 text-emerald-700">
            <BookOpenText className="w-5 h-5" />
            <h2 className="font-bold">Sejarah Desa</h2>
          </div>
          <Textarea 
            label="Teks Sejarah Lengkap" 
            rows={8} 
            placeholder="Tuliskan sejarah berdirinya desa di sini..." 
          />
        </div>
      </form>
    </div>
  );
}