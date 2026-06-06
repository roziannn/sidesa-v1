/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status, transaction_id, payment_type } = body;

    // 1. CEK ENVIRONMENT VARIABLES
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.MIDTRANS_SERVER_KEY) {
      console.error("Missing Environment Variables");
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
    }

    // 2. VERIFIKASI SIGNATURE
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const inputString = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const signature = crypto.createHash("sha512").update(inputString).digest("hex");

    // Jika signature tidak cocok, jangan proses
    if (signature !== signature_key) {
      console.error("Webhook Signature Mismatch for:", order_id);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3. Inisialisasi Supabase Admin
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // 4. Status Mapping
    let finalStatus = "pending";
    if ((transaction_status === "capture" && fraud_status === "accept") || transaction_status === "settlement") {
      finalStatus = "success";
    } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
      finalStatus = "failed";
    }

    // 5. Update Database dengan Error Handling per langkah
    if (finalStatus === "success") {
      const { error: trxError } = await supabaseAdmin
        .from("transaksi")
        .update({
          status: "success",
          metode_bayar: payment_type,
          midtrans_transaction_id: transaction_id,
          raw_response: body,
        })
        .eq("midtrans_order_id", order_id);

      if (trxError) throw trxError;

      const { data: trx, error: selectError } = await supabaseAdmin.from("transaksi").select("retribusi_id").eq("midtrans_order_id", order_id).single();

      if (trx && !selectError) {
        await supabaseAdmin.from("retribusi").update({ status: "lunas" }).eq("id", trx.retribusi_id);
      }
    } else {
      await supabaseAdmin.from("transaksi").update({ status: finalStatus }).eq("midtrans_order_id", order_id);
    }

    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook Internal Error Details:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
