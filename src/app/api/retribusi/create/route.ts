import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { warga_id, jenis, jumlah, jatuh_tempo } = body;

    if (!warga_id || !jenis || !jumlah || !jatuh_tempo) {
      return NextResponse.json(
        { error: "Data tidak lengkap" }, 
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("retribusi") 
      .insert([
        {
          warga_id: warga_id,
          jenis: jenis,
          jumlah: Number(jumlah),
          jatuh_tempo: jatuh_tempo, 
          status: "belum_bayar",
        },
      ])
      .select();

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
    
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan tagihan" }, 
      { status: 500 }
    );
  }
}