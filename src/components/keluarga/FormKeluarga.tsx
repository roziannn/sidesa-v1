"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Loader2 } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { keluargaSchema, type KeluargaFormValues } from "@/types/keluarga";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import Textarea from "@components/ui/Textarea";

interface FormKeluargaProps {
  mode: "tambah" | "edit";
  idKeluarga?: string;
}

export default function FormKeluarga({ mode, idKeluarga }: FormKeluargaProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(mode === "edit");

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<KeluargaFormValues>({
    resolver: zodResolver(keluargaSchema),
    defaultValues: {
      nomor_kk: "",
      nama_kepala: "",
      nik_kepala: "",
      alamat: "",
      rt: "",
      rw: "",
    },
  });

  // Ambil data awal jika sedang dalam mode EDIT
  useEffect(() => {
    if (mode === "edit" && idKeluarga) {
      const fetchKeluarga = async () => {
        const { data, error } = await supabaseClient
          .from("keluarga")
          .select("*")
          .eq("id", idKeluarga)
          .single();

        if (error) {
          showToast("error", "Gagal memuat data", error.message);
          router.push("/dashboard/keluarga");
          return;
        }

        if (data) {
          setValue("nomor_kk", data.no_kk);
          setValue("nama_kepala", data.nama_kepala);
          setValue("rt", data.rt);
          setValue("rw", data.rw);
          setValue("alamat", data.alamat);
          setValue("nik_kepala", data.nik_kepala || ""); 
        }
        setIsLoadingData(false);
      };

      fetchKeluarga();
    }
  }, [mode, idKeluarga, setValue, router, showToast]);

  // Fungsi Submit + Validasi Ganda ke Supabase
  const onSubmit = async (values: KeluargaFormValues) => {
    setIsSubmitting(true);

    try {
      // --------------------------------------------------------------
      // VALIDASI 1: Cek keunikan Nomor KK ke tabel 'keluarga'
      // --------------------------------------------------------------
      const checkKkQuery = supabaseClient
        .from("keluarga")
        .select("no_kk")
        .eq("no_kk", values.nomor_kk);
      
      if (mode === "edit" && idKeluarga) {
        checkKkQuery.neq("id", idKeluarga);
      }

      const { data: existingKk, error: errorCheckKk } = await checkKkQuery;
      if (errorCheckKk) throw errorCheckKk;

      if (existingKk && existingKk.length > 0) {
        setError("nomor_kk", { message: "Nomor KK sudah terdaftar di sistem" });
        setIsSubmitting(false);
        return;
      }

      // --------------------------------------------------------------
      // VALIDASI 2: Cek keunikan NIK Kepala Keluarga ke tabel 'anggota'
      // --------------------------------------------------------------
      const checkNikQuery = supabaseClient
        .from("anggota")
        .select("nik, keluarga_id")
        .eq("nik", values.nik_kepala);

      const { data: existingNik, error: errorCheckNik } = await checkNikQuery;
      if (errorCheckNik) throw errorCheckNik;

      if (existingNik && existingNik.length > 0) {
        // Jika mode edit, toleransi jika NIK tersebut terdaftar di dalam KK yang sama
        const belongsToSameFamily = mode === "edit" && existingNik[0].keluarga_id === idKeluarga;
        
        if (!belongsToSameFamily) {
          setError("nik_kepala", { message: "NIK sudah terdaftar pada warga/anggota keluarga lain" });
          setIsSubmitting(false);
          return;
        }
      }

      // susun data payload
      const dbPayload = {
        no_kk: values.nomor_kk,
        nama_kepala: values.nama_kepala,
        rt: values.rt,
        rw: values.rw,
        alamat: values.alamat,
        nik_kepala: values.nik_kepala, 
      };

      // --------------------------------------------------------------
      // EKSEKUSI DATA (INSERT / UPDATE)
      // --------------------------------------------------------------
      if (mode === "tambah") {
        const { error } = await supabaseClient
          .from("keluarga")
          .insert([dbPayload]);
          
        if (error) throw error;
        showToast("success", "Berhasil", "Data keluarga baru berhasil ditambahkan.");
      } else {
        const { error } = await supabaseClient
          .from("keluarga")
          .update(dbPayload)
          .eq("id", idKeluarga);
          
        if (error) throw error;
        showToast("success", "Berhasil", "Perubahan data keluarga berhasil diperbarui.");
      }

      router.push("/dashboard/keluarga");
      router.refresh();
    } catch (error: any) {
      showToast("error", "Gagal Menyimpan", error.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Nomor KK */}
        <div className="flex flex-col gap-1">
          <Input
            label="Nomor KK"
            maxLength={16}
            required
            {...register('nomor_kk')}
            error={errors.nomor_kk?.message}
          />
        </div>

        {/* Nama Kepala Keluarga */}
        <div className="flex flex-col gap-1">
          <Input
            label="Nama Kepala Keluarga"
            required
            {...register('nama_kepala')}
            error={errors.nama_kepala?.message}
          />
        </div>

        {/* NIK Kepala Keluarga */}
        <div className="flex flex-col gap-1">
          <Input
              label="NIK Kepala Keluarga"
              required
              maxLength={16}
              {...register('nik_kepala')}
              error={errors.nik_kepala?.message}
          />  
        </div>

        {/* RT / RW Group */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Input
              label="RT"
              required
              placeholder="00"
              maxLength={3}
              {...register('rt')}
              error={errors.rt?.message}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Input
              label="RW"
              required
              placeholder="00"
              maxLength={3}
              {...register('rw')}
              error={errors.rw?.message}
            />
          </div>
        </div>

        {/* Alamat Lengkap */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <div className="md:col-span-2">
            <Textarea
              label="Alamat Lengkap"
              required
              rows={3}
              {...register('alamat')}
              error={errors.alamat?.message}
            />
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS BAR */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-6">
        <Button
        type="button"
        variant="outline"
        disabled={isSubmitting}
        onClick={() => router.push('/dashboard/keluarga')}
      >
        Batal
      </Button>
        
      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        loading={isSubmitting}
        leftIcon={
          !isSubmitting && (
            <Save className="h-4 w-4" />
          )
        }
      >
        Simpan Data
      </Button>
      </div>
    </form>
  );
}