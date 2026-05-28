/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSuratDomisili } from "@/lib/pdf/templates/SuratDomisili";
import { SuratDomisiliPayload } from "@/types/surat";

const toRomawi = (month: number): string => {
  const romawiArr = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return romawiArr[month - 1] || "I";
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { surat_id } = body;

    if (!surat_id) {
      return NextResponse.json({ error: "ID Permohonan Surat wajib disertakan." }, { status: 400 });
    }

    const supabase = await createClient();

    // =========================================================================
    // STEP 1: AMBIL DATA LENGKAP (SURAT + JOIN PROFILES)
    // =========================================================================
    const { data: surat, error: suratError } = await supabase
      .from("surat")
      .select(
        `
        id, jenis_surat, keperluan, status, pemohon_id,
        profiles!pemohon_id(id, nama, rt, rw)
      `,
      )
      .eq("id", surat_id)
      .maybeSingle();

    if (suratError) throw new Error(`Database error: ${suratError.message}`);
    if (!surat) return NextResponse.json({ error: "Permohonan surat tidak ditemukan." }, { status: 404 });

    const pemohon = (surat as any).profiles;
    if (!pemohon) return NextResponse.json({ error: "Profil pemohon tidak ditemukan." }, { status: 404 });

    // =========================================================================
    // STEP 2: AMBIL DETAIL DATA ANGGOTA (BERDASARKAN NIK)
    // =========================================================================
    const { data: anggota } = await supabase.from("anggota").select("nik, tgl_lahir, jenis_kelamin, hubungan, nama").eq("nik", pemohon.nik).maybeSingle();

    const dataWargaSipil = anggota || ({} as any);

    // =========================================================================
    // STEP 3: GENERATE NOMOR SURAT
    // =========================================================================
    const { count, error: countError } = await supabase.from("surat").select("*", { count: "exact", head: true }).eq("status", "selesai");

    if (countError) throw new Error(`Gagal menghitung nomor: ${countError.message}`);

    const nextUrutan = ((count || 0) + 1).toString().padStart(3, "0");
    const now = new Date();
    const nomorSuratFinal = `${nextUrutan}/KADES/${toRomawi(now.getMonth() + 1)}/${now.getFullYear()}`;

    // =========================================================================
    // STEP 4 & 5: GENERATE PDF
    // =========================================================================
    const payloadTemplate: SuratDomisiliPayload = {
      nomor_urut: nextUrutan,
      keperluan: surat.keperluan || "-",
      tanggal_generate: now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      warga: {
        nama: pemohon.nama || dataWargaSipil.nama || "-",
        nik: pemohon.nik || dataWargaSipil.nik || "-",
        tempat_lahir: dataWargaSipil.tempat_lahir || "-",
        tanggal_lahir: dataWargaSipil.tgl_lahir || "-",
        jenis_kelamin: dataWargaSipil.jenis_kelamin || "laki-laki",
        agama: dataWargaSipil.agama || "-",
        pekerjaan: dataWargaSipil.pekerjaan || "-",
        alamat: dataWargaSipil.alamat || "-",
        rt: pemohon.rt || "00",
        rw: pemohon.rw || "00",
      },
      desa: {
        nama_desa: "Digital Makmur",
        nama_kecamatan: "Cikarang Pusat",
        nama_kabupaten: "Bekasi",
        alamat_kantor: "Jl. Raya Utama No. 10 Kelurahan Digital",
        no_telp: "(021) 8991234",
        kode_pos: "17530",
        kode_desa: "DD-MKM",
        nama_kepala_desa: "Supriatna S.IP",
        nip_kepala_desa: "198204122010011002",
      },
    };

    const doc = generateSuratDomisili(payloadTemplate);
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // =========================================================================
    // STEP 6: UPLOAD KE STORAGE
    // =========================================================================
    const storagePath = `surat/${surat_id}/${nomorSuratFinal.replace(/\//g, "-")}.pdf`;
    const { error: uploadError } = await supabase.storage.from("surat-output").upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

    if (uploadError) throw new Error(`Upload Gagal: ${uploadError.message}`);

    const {
      data: { publicUrl },
    } = supabase.storage.from("surat-output").getPublicUrl(storagePath);

    // =========================================================================
    // STEP 7: UPDATE STATUS SURAT
    // =========================================================================
    const { error: updateError } = await supabase
      .from("surat")
      .update({
        status: "selesai",
        file_url: publicUrl,
        catatan_petugas: `Surat digenerate pada ${now.toLocaleString("id-ID")} WIB.`,
      })
      .eq("id", surat_id);

    if (updateError) throw new Error(`Update Status Gagal: ${updateError.message}`);

    return NextResponse.json({ success: true, file_url: publicUrl, nomor_surat: nomorSuratFinal });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
