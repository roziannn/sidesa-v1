'use client';
import { useState } from 'react';
import { useToast } from "@/hooks/useToast"; 

export default function FormPengaduan() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast(); 

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      showToast("success", "Berhasil Terkirim", "Terima kasih, pengaduan Anda telah kami terima.");
      e.currentTarget.reset();
    } catch (error) {
      showToast("error", "Gagal Mengirim", "Terjadi kesalahan saat mengirim pengaduan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-sm border border-slate-200">
        <div className="mb-8 pb-6 border-b border-slate-100">
          <h1 className="text-xl font-semibold text-slate-900">Form Pengaduan Masyarakat</h1>
          <p className="text-slate-500 text-sm mt-1">Lengkapi data di bawah ini untuk memproses laporan Anda.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Lengkap */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
              <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition" />
            </div>

            {/* No Telp */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">No. Telepon/WA</label>
              <input required type="tel" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition" />
            </div>
          </div>

          {/* Alamat */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Alamat</label>
            <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition" />
          </div>

          {/* Jenis Pengaduan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Jenis Pengaduan</label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition">
              <option value="fasilitas">Fasilitas Umum</option>
              <option value="keamanan">Keamanan</option>
              <option value="kebersihan">Kebersihan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          {/* Isi Pengaduan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Isi Pengaduan</label>
            <textarea required rows={5} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition"></textarea>
          </div>

          <div className="pt-4">
            <button 
              disabled={loading}
              className="w-full bg-blue-700 text-white font-medium py-2.5 rounded hover:bg-blue-800 transition disabled:opacity-50 uppercase tracking-wide text-sm"
            >
              {loading ? "Memproses..." : "Kirim Pengaduan"}
            </button>
          </div>
        </form>
      </div>

      {/* Footer SIDESA */}
      <div className="mt-8 text-center">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
          SIDESA © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}