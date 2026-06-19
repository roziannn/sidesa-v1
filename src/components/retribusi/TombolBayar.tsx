/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { formatRupiah } from "@/lib/format";
import { useToast } from "@/hooks/useToast";
import { Loader2, CreditCard } from "lucide-react";
import Button from "@components/ui/Button";

// Deklarasi Global untuk Midtrans Snap
declare global {
  interface Window {
    snap: {
      pay: (token: string, options: any) => void;
    };
  }
}

interface TombolBayarProps {
  retribusiId: string;
  jumlah: number;
  namaWarga: string;
  onSuccess: () => void;
  onPending: () => void;
}

export default function TombolBayar({ retribusiId, jumlah, namaWarga, onSuccess, onPending }: TombolBayarProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const snapSrc = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true" ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js";

    const script = document.createElement("script");
    script.src = snapSrc;
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!);
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retribusi_id: retribusiId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat transaksi");

      // Buka Snap Payment Window
      window.snap.pay(data.snap_token, {
        onSuccess: (result: any) => {
          showToast("success", "Pembayaran berhasil! 🎉", "Terima kasih telah membayar.");
          onSuccess();
        },
        onPending: (result: any) => {
          showToast("warning", "Menunggu Pembayaran", "Selesaikan pembayaran sesuai instruksi.");
          onPending();
        },
        onError: (result: any) => {
          showToast("error", "Pembayaran gagal", "Silakan coba lagi.");
        },
        onClose: () => {
          showToast("warning", "Pembayaran dibatalkan", "Tagihan masih aktif.");
        },
      });
    } catch (err: any) {
      showToast("error", "Gagal", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
   <Button
      variant="warning" 
      size="xs"
      loading={loading}
      leftIcon={<CreditCard className="w-3 h-3" />}
      onClick={handlePay}
    >
      Bayar Online
    </Button>
  );
}
