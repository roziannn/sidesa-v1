/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/payment/webhook/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js"; // Gunakan Supabase Admin Client
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status, transaction_id, payment_type } = body;

    // 1. VERIFIKASI SIGNATURE (PENCEGAHAN MANIPULASI)
    // Signature = SHA512(order_id + status_code + gross_amount + ServerKey)
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const inputString = order_id + status_code + gross_amount + serverKey;
    const signature = crypto.createHash("sha512").update(inputString).digest("hex");

    if (signature !== signature_key) {
      console.error("Webhook Signature Mismatch:", order_id);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Inisialisasi Supabase Admin (Service Role)
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // 3. Tentukan status pembayaran
    let finalStatus = "pending";
    if (transaction_status === "capture" && fraud_status === "accept") finalStatus = "success";
    else if (transaction_status === "settlement") finalStatus = "success";
    else if (["cancel", "deny", "expire"].includes(transaction_status)) finalStatus = "failed";

    // 4. Proses update database
    if (finalStatus === "success") {
      // Update tabel transaksi
      await supabaseAdmin
        .from("transaksi")
        .update({
          status: "success",
          metode_bayar: payment_type,
          midtrans_transaction_id: transaction_id,
          raw_response: body,
        })
        .eq("midtrans_order_id", order_id);

      // Ambil retribusi_id dulu
      const { data: trx } = await supabaseAdmin.from("transaksi").select("retribusi_id").eq("midtrans_order_id", order_id).single();

      if (trx) {
        // Update tabel retribusi ke 'lunas'
        await supabaseAdmin.from("retribusi").update({ status: "lunas" }).eq("id", trx.retribusi_id);

        // TODO: Trigger Email Notifikasi (Gunakan library email Anda di sini)
        console.log("Pembayaran berhasil untuk:", order_id);
      }
    } else {
      // Update status failed/expired
      await supabaseAdmin.from("transaksi").update({ status: finalStatus }).eq("midtrans_order_id", order_id);
    }

    // 5. Return 200 OK agar Midtrans berhenti melakukan retry
    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
