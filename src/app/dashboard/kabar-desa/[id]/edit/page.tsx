"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import KabarDesaForm from "@/components/kabar-desa/KabarDesaForm";
import { Loader2 } from "lucide-react";

export default function EditKabarPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      const { data: kabar, error } = await supabaseClient
        .from("kabar_desa")
        .select("*")
        .eq("id", id)
        .single();

      if (kabar) setData(kabar);
      if (error) console.error("Error:", error);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="p-6 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  if (!data) return <div className="p-6">Data tidak ditemukan.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-6">Edit Kabar Desa</h1>
      <KabarDesaForm initialData={data} />
    </div>
  );
}