/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/payment/create/route.ts
import { NextResponse } from "next/server";
import { snap } from "@/lib/midtrans";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { retribusi_id } = await req.json();
    const supabase = await createClient();

    // 1. Validasi Autentikasi User
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Ambil data retribusi dan join ke profil warga
    const { data: retribusi, error: fetchError } = await supabase.from("retribusi").select("*, profiles(nama, email)").eq("id", retribusi_id).single();

    if (fetchError || !retribusi) {
      return NextResponse.json({ error: "Retribusi tidak ditemukan" }, { status: 404 });
    }

    // Validasi status bayar
    if (retribusi.status === "lunas") {
      return NextResponse.json({ error: "Tagihan ini sudah dibayar" }, { status: 400 });
    }

    // 3. Generate unique order_id
    const shortId = retribusi_id.toString().slice(0, 6).toUpperCase();
    const order_id = `DESA-${shortId}-${Date.now()}`;

    // 4. Siapkan parameter transaksi untuk Midtrans
    const transactionDetails = {
      transaction_details: {
        order_id: order_id,
        gross_amount: retribusi.jumlah,
      },
      customer_details: {
        first_name: retribusi.profiles?.nama || "Warga",
        email: retribusi.profiles?.email || "",
      },
      item_details: [
        {
          id: retribusi.id,
          price: retribusi.jumlah,
          quantity: 1,
          name: `Retribusi ${retribusi.jenis} - ${retribusi.profiles?.nama}`,
        },
      ],
      expiry: {
        unit: "hours",
        duration: 24,
      },
    };

    // 5. Buat transaksi di Midtrans Snap
    const transaction = await snap.createTransaction(transactionDetails);

    // 6. Simpan referensi ke tabel transaksi
    const { error: insertError } = await supabase.from("transaksi").insert({
      retribusi_id: retribusi.id,
      midtrans_order_id: order_id,
      snap_token: transaction.token,
      status: "pending",
      jumlah: retribusi.jumlah,
    });
    if (insertError) {
      console.error("Supabase Insert Error Detail:", insertError);
      throw new Error(`Gagal menyimpan ke database: ${insertError.message}`);
    }

    // 7. Return response
    return NextResponse.json({
      snap_token: transaction.token,
      order_id: order_id,
    });
  } catch (error: any) {
    console.error("Payment Creation Error:", error);
    // Hindari mengekspos error internal secara detail ke user
    return NextResponse.json({ error: "Terjadi kesalahan saat memproses pembayaran" }, { status: 500 });
  }
}
