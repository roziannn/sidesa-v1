/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { Save, Calendar, MapPin, Clock, Users, Info, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/format";
import Card from "@components/ui/Card";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import Select from "@components/ui/Select";
import Textarea from "@components/ui/Textarea";
import Toggle from "@components/ui/Toggle";

interface FormKegiatanProps {
  initialData?: {
    id?: string;
    judul: string;
    deskripsi?: string | null;
    tanggal: string;
    waktu_mulai: string;
    waktu_selesai: string;
    lokasi: string;
    kuota?: number | null;
    status: "aktif" | "nonaktif";
    catatan?: string | null;
  };
  mode: "create" | "edit";
}

export default function FormKegiatan({ initialData, mode }: FormKegiatanProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [judul, setJudul] = useState(initialData?.judul || "");
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi || "");
  const [tanggal, setTanggal] = useState(initialData?.tanggal || "");
  const [waktuMulai, setWaktuMulai] = useState(initialData?.waktu_mulai || "");
  const [waktuSelesai, setWaktuSelesai] = useState(initialData?.waktu_selesai || "");
  const [lokasi, setLokasi] = useState(initialData?.lokasi || "");
  const [kuota, setKuota] = useState<number | "">(initialData?.kuota ?? "");
  const [status, setStatus] = useState<"aktif" | "nonaktif">(initialData?.status || "aktif");

  // STATE KEGIATAN BERULANG (RECURRING EVENTS)
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"weekly" | "biweekly" | "monthly">("weekly");
  const [repeatCount, setRepeatCount] = useState<number>(2);

  const isValid = useMemo(() => {
    return judul.length >= 5 && tanggal && waktuMulai && waktuSelesai && lokasi;
  }, [judul, tanggal, waktuMulai, waktuSelesai, lokasi]);

  // LOGIKA MENGHITUNG DAFTAR TANGGAL BERULANG
  const recurringDates = useMemo(() => {
    if (!tanggal || !isRecurring) return [];

    const dates: string[] = [];
    const baseDate = new Date(tanggal);

    for (let i = 0; i < repeatCount; i++) {
      const nextDate = new Date(baseDate);

      if (frequency === "weekly") {
        nextDate.setDate(baseDate.getDate() + i * 7);
      } else if (frequency === "biweekly") {
        nextDate.setDate(baseDate.getDate() + i * 14);
      } else if (frequency === "monthly") {
        nextDate.setMonth(baseDate.getMonth() + i);
      }

      // Format kembali ke YYYY-MM-DD untuk standard input / PostgreSQL date
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, "0");
      const dd = String(nextDate.getDate()).padStart(2, "0");
      dates.push(`${yyyy}-${mm}-${dd}`);
    }

    return dates;
  }, [tanggal, isRecurring, frequency, repeatCount]);

  const handleSubmit = async () => {
    if (!isValid) {
      showToast("error", "Validasi gagal", "Mohon isi semua field yang wajib");
      return;
    }
    setLoading(true);

    try {
      const basePayload = {
        judul,
        deskripsi,
        waktu_mulai: waktuMulai,
        waktu_selesai: waktuSelesai,
        lokasi,
        kuota: kuota === "" ? null : Number(kuota),
        status,
      };

      if (mode === "create") {
        if (isRecurring && recurringDates.length > 0) {
          // BATCH INSERT UNTUK KEGIATAN BERULANG
          const batchPayloads = recurringDates.map((dateStr) => ({
            ...basePayload,
            tanggal: dateStr,
          }));

          const { data: insertedData, error } = await supabaseClient.from("kegiatan").insert(batchPayloads).select();

          if (error) throw error;

          showToast("success", "Berhasil", `${insertedData.length} kegiatan berhasil dibuat sekaligus!`);
          // Redirect ke halaman list kegiatan karena datanya banyak
          router.push("/dashboard/kegiatan");
        } else {
          // SINGLE INSERT BIASA
          const { data, error } = await supabaseClient
            .from("kegiatan")
            .insert({ ...basePayload, tanggal })
            .select()
            .single();

          if (error) throw error;

          showToast("success", "Berhasil", "Kegiatan telah disimpan");
          router.push(`/dashboard/kegiatan/${data.id}`);
        }
      } else {
        // UPDATE BIASA (MODE EDIT)
        const { data, error } = await supabaseClient
          .from("kegiatan")
          .update({ ...basePayload, tanggal })
          .eq("id", initialData?.id)
          .select()
          .single();

        if (error) throw error;

        showToast("success", "Berhasil", "Kegiatan telah diperbarui");
        router.push(`/dashboard/kegiatan/${data.id}`);
      }

      router.refresh();
    } catch (err: any) {
      showToast("error", "Gagal", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <Card
      className="lg:col-span-2"
      title={
        mode === "create"
          ? "Buat Kegiatan Baru"
          : "Edit Kegiatan"
      }
      description="Lengkapi informasi kegiatan desa."
    >
      <div className="space-y-6">

        {/* main info */}
        <section className="space-y-4">
          <Input
            label="Nama Program"
            required
            placeholder='Contoh: "PKH 2026" atau "BLT Dana Desa"'
            value={judul}
            onChange={(e) =>
              setJudul(e.target.value)
            }
          />

          <Textarea
            label="Deskripsi"
            rows={3 }
            placeholder="Detail kegiatan..."
            value={deskripsi}
            onChange={(e) =>
              setDeskripsi(e.target.value)
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tanggal"
              type="date"
              value={tanggal}
              onChange={(e) =>
                setTanggal(e.target.value)
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Mulai"
                type="time"
                value={waktuMulai}
                onChange={(e) =>
                  setWaktuMulai(
                    e.target.value
                  )
                }
              />

              <Input
                label="Selesai"
                type="time"
                value={waktuSelesai}
                onChange={(e) =>
                  setWaktuSelesai(
                    e.target.value
                  )
                }
              />
            </div>

            <Input
              label="Lokasi"
              placeholder="Lokasi kegiatan"
              value={lokasi}
              onChange={(e) =>
                setLokasi(e.target.value)
              }
            />

            <Input
              label="Kuota"
              type="number"
              placeholder="Opsional"
              value={kuota}
              onChange={(e) =>
                setKuota(
                  e.target.value === ""
                    ? ""
                    : Number(
                        e.target.value
                      )
                )
              }
            />
          </div>
        </section>

        {/* kegiatan looping */}
        {mode === "create" && (
          <Card
            padding="sm"
            className="bg-slate-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw
                  className={`w-4 h-4 text-slate-500 ${
                    isRecurring
                      ? "animate-spin-slow"
                      : ""
                  }`}
                />

                <span className="text-sm font-semibold text-slate-700">
                  Kegiatan Berulang
                </span>
              </div>

              <Toggle
                checked={isRecurring}
                onChange={setIsRecurring}
                label="Kegiatan Berulang"
                description="Buat beberapa kegiatan sekaligus berdasarkan frekuensi."
              />
            </div>

            {isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Select
                  label="Frekuensi"
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(
                      e.target.value as any
                    )
                  }
                >
                  <option value="weekly">
                    Mingguan
                  </option>

                  <option value="biweekly">
                    Dua Mingguan
                  </option>

                  <option value="monthly">
                    Bulanan
                  </option>
                </Select>

                <Input
                  label="Jumlah Pengulangan"
                  type="number"
                  min={2}
                  max={12}
                  value={repeatCount}
                  onChange={(e) =>
                    setRepeatCount(
                      Math.min(
                        12,
                        Math.max(
                          2,
                          Number(
                            e.target.value
                          )
                        )
                      )
                    )
                  }
                />
              </div>
            )}
          </Card>
        )}

        {/* status */}
        <Card
          padding="sm"
          className="bg-slate-50"
        >
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-slate-600">
              Status
            </span>

            {(
              [
                "aktif",
                "nonaktif",
              ] as const
            ).map((s) => (
              <label
                key={s}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  checked={
                    status === s
                  }
                  onChange={() =>
                    setStatus(s)
                  }
                  className="accent-emerald-600"
                />

                <span className="capitalize">
                  {s}
                </span>
              </label>
            ))}
          </div>
        </Card>

          <Button
            variant="primary"
            fullWidth
            loading={loading}
            disabled={!isValid}
            onClick={handleSubmit}
            leftIcon={
              !loading ? (
                <Save className="w-4 h-4" />
              ) : undefined
            }
          >
            {mode === "create" &&
            isRecurring
              ? "Simpan Semua Kegiatan"
              : "Simpan Perubahan"}
          </Button>
        </div>
      </Card>

      {/* preview */}
      <Card
          className="h-fit sticky top-6"
          title="Preview Kegiatan"
          description="Ringkasan informasi kegiatan yang akan disimpan."
        >
        <div className="space-y-4">
          <p className="font-bold text-slate-800 text-lg leading-snug">
          Nama Kegiatan: {judul || "Nama Program"}
          </p>

          <div className="space-y-2 text-md text-slate-600">
            <p>
              📅{" "}
              {tanggal
                ? formatDate(new Date(tanggal))
                : "Tanggal belum dipilih"}
            </p>

            <p>
              ⏰ {waktuMulai || "--"} - {waktuSelesai || "--"}
            </p>

            <p>
              📍 {lokasi || "Lokasi belum ditentukan"}
            </p>
          </div>

          {kuota && (
            <div className="pt-3 border-t border-dashed border-slate-200">
              <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                Kuota: {kuota} Orang
              </span>
            </div>
          )}
        </div>

        {isRecurring &&
          recurringDates.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Akan Membuat{" "}
                {recurringDates.length} Kegiatan
              </span>

              <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2">
                {recurringDates.map(
                  (dateStr, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs text-slate-600"
                    >
                      <span className="w-6 text-slate-400">
                        #{index + 1}
                      </span>

                      <span>
                        {formatDate(
                          new Date(dateStr)
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
      </Card>
    </div>
  );
}

function InputIcon({ icon, type = "text", placeholder, value, onChange }: any) {
  return (
    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all bg-white">
      {icon}
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-sm outline-none bg-transparent" />
    </div>
  );
}
