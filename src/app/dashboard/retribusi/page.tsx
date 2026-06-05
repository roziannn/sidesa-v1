import { createClient } from "@/lib/supabase/server";
import RetribusiClient from "@/components/retribusi/RetribusiClient";
import { Plus } from "lucide-react";

export default async function RetribusiPage() {
  const supabase = await createClient();

  // Ambil data retribusi + join ke profiles
  const { data: retribusi, error } = await supabase
    .from("retribusi")
    .select(`
      id, jenis, jumlah, jatuh_tempo, status,
      profiles(nama, rt, rw)
    `)
    .order("jatuh_tempo", { ascending: true });
// Definisikan tipe untuk data yang datang dari Supabase
interface RetribusiRaw {
  id: string;
  jenis: string;
  jumlah: number;
  jatuh_tempo: string;
  status: "lunas" | "belum_bayar" | "jatuh_tempo";
  profiles: { nama: string; rt: string; rw: string } | null;
}

// Gunakan tipe tersebut di dalam map
const formattedData = (retribusi as unknown as RetribusiRaw[])?.map(r => ({
  id: r.id,
  warga_nama: r.profiles?.nama ?? "-",
  rt: r.profiles?.rt ?? "-",
  rw: r.profiles?.rw ?? "-",
  jenis: r.jenis,
  jumlah: r.jumlah,
  jatuh_tempo: r.jatuh_tempo,
  status: r.status,
})) || [];

  return (
    <div className="p-6">

      <RetribusiClient initialData={formattedData} />
    </div>
  );
}