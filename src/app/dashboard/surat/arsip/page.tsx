import { createClient } from "@/lib/supabase/server";
import ArsipClient from "@/components/surat/ArsipClient"; 

export default async function ArsipPage() {
  const supabase = await createClient();

  const { data: arsip, error } = await supabase
    .from("surat")
    .select(`
      id,  jenis_surat, status, created_at, file_url,
      profiles!pemohon_id(nama)
    `)
    .eq("status", "selesai")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Arsip Surat</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola permohonan arsip surat dan dokumen warga.</p>
        </div>
      <ArsipClient initialData={arsip || []} />
    </div>
  );
}