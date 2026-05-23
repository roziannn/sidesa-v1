import { z } from "zod";

export const keluargaSchema = z.object({
  nomor_kk: z
    .string()
    .min(16, { message: "Nomor KK harus tepat 16 digit" })
    .max(16, { message: "Nomor KK harus tepat 16 digit" })
    .regex(/^\d+$/, { message: "Nomor KK tidak valid (harus berupa angka semua)" }),
  nama_kepala: z
    .string()
    .min(3, { message: "Nama Kepala Keluarga minimal 3 karakter" }),
  nik_kepala: z
    .string()
    .min(16, { message: "NIK harus tepat 16 digit" })
    .max(16, { message: "NIK harus tepat 16 digit" })
    .regex(/^\d+$/, { message: "NIK tidak valid (harus berupa angka semua)" }),
  alamat: z
    .string()
    .min(10, { message: "Alamat lengkap minimal 10 karakter" }),
  rt: z
    .string()
    .min(1, { message: "RT wajib diisi" })
    .max(3, { message: "Maksimal 3 digit" })
    .transform((val) => val.padStart(2, "0")),
  rw: z
    .string()
    .min(1, { message: "RW wajib diisi" })
    .max(3, { message: "Maksimal 3 digit" })
    .transform((val) => val.padStart(2, "0")),
});

export type KeluargaFormValues = z.infer<typeof keluargaSchema>;