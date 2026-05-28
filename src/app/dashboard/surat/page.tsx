/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import SuratClient from "@/components/surat/SuratClient";

export const revalidate = 0;

export default async function SuratPage() {
  // Ambil data surat beserta join profile lewat foreign key pemohon_id
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("surat")
    .select(
      `
    id,
    jenis_surat,
    keperluan,
    status,
    created_at,
    catatan_petugas,
    file_url,
    pemohon_id,
    profiles:pemohon_id (
      id,
      nama,
      rt,
      rw
    )
  `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading surat:", error);
  }

  // Normalisasi data dengan aman jika hasil join berupa array atau objek langsung
  const formattedSurat = (data || []).map((surat: any) => {
    let profileData = surat.profiles;
    if (Array.isArray(profileData)) {
      profileData = profileData[0];
    }

    return {
      ...surat,
      profiles: profileData || { id: "", nama: "Warga Anonim", rt: "00", rw: "00" },
    };
  });

  return (
    <div className="space-y-6 pb-12">
      <SuratClient initialSurat={formattedSurat as any} />
    </div>
  );
}
