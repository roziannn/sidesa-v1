import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const supabase = await createClient();

    // Mencari data warga berdasarkan nama yang mirip (case-insensitive)
    const { data: warga, error } = await supabase
      .from("profiles")
      .select("id, nama, rt, rw")
      .ilike("nama", `%${query}%`)
      .limit(10); // Batasi 10 hasil agar performa tetap ringan

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(warga);
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}