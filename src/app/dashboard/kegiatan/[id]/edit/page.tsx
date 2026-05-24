import { supabaseClient } from "@/lib/supabase/client";
import FormKegiatan from "@/components/kegiatan/FormKegiatan";

export default async function Page({ params }: { params: { id: string } }) {
  const { data } = await supabaseClient.from("kegiatan").select("*").eq("id", params.id).single();

  if (!data) {
    return <div className="p-6">Kegiatan tidak ditemukan</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Edit Kegiatan</h1>
      <FormKegiatan mode="edit" initialData={data} />
    </div>
  );
}
