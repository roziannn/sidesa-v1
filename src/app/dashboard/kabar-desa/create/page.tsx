import KabarDesaForm from "@components/kabar-desa/KabarDesaForm";

export default function CreateKabarDesaPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tambah Kabar Baru</h1>
        <p className="text-sm text-slate-500 mt-1">Buat konten berita atau pengumuman desa baru.</p>
      </div>
      <KabarDesaForm />
    </div>
  );
}