import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

const jenisPengaduan = [
  'Fasilitas Umum',
  'Keamanan',
  'Kebersihan',
  'Lingkungan',
  'Lainnya',
] as const;

const schema = z.object({
  nama: z
    .string()
    .trim()
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama terlalu panjang'),

  noTelp: z
    .string()
    .trim()
    .regex(
      /^08[0-9]{8,11}$/,
      'Nomor HP tidak valid'
    ),

  alamat: z
    .string()
    .trim()
    .min(5, 'Alamat terlalu pendek')
    .max(500, 'Alamat terlalu panjang'),

  jenis: z.enum(jenisPengaduan),

  isi: z
    .string()
    .trim()
    .min(
      10,
      'Isi pengaduan minimal 10 karakter'
    )
    .max(
      5000,
      'Isi pengaduan terlalu panjang'
    ),
});

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const validation =
      schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Data tidak valid',
          errors:
            validation.error.flatten(),
        },
        {
          status: 422,
        }
      );
    }

    const data = validation.data;

    const supabase =
      await createClient();

    const { error } =
      await supabase
        .from('pengaduan')
        .insert({
          nama_warga: data.nama,
          no_telp: data.noTelp,
          alamat: data.alamat,
          jenis: data.jenis,
          isi_pengaduan: data.isi,

          tanggal:
            new Date()
              .toISOString()
              .split('T')[0],

          prioritas: 'Sedang',
          status: 'Menunggu',

          petugas: null,
          catatan_petugas: null,
        });

    if (error) {
      console.error(
        '[PENGADUAN_INSERT]',
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            'Gagal menyimpan pengaduan',
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          'Pengaduan berhasil dikirim',
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      '[PENGADUAN_API]',
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Terjadi kesalahan pada server',
      },
      {
        status: 500,
      }
    );
  }
}