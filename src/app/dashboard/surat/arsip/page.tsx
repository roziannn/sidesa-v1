import { createClient } from "@/lib/supabase/server";
import ArsipClient from "@/components/surat/ArsipClient"; 

export default async function ArsipPage() {
  const supabase = await createClient();

  // Ambil data awal dengan join ke profiles
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
      <h1 className="text-2xl font-bold mb-6">Arsip Surat</h1>
      <ArsipClient initialData={arsip || []} />
    </div>
  );
}