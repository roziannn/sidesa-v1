import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID tagihan tidak ditemukan" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error: updateError } = await supabase
      .from("retribusi")
      .update({ status: "lunas" })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error memproses pembayaran:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}