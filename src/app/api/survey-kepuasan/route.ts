import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

const pelayananOptions = [
  'Surat Keterangan Domisili',
  'Surat Keterangan Usaha',
  'Surat Pengantar KTP',
  'Surat Pengantar KK',
  'Bantuan Sosial',
  'Pengaduan Masyarakat',
  'Pelayanan Umum',
] as const;

const nilaiSchema = z.enum([
  '1',
  '2',
  '3',
  '4',
  '5',
]);

const surveySchema = z.object({
  nama: z
    .string()
    .trim()
    .min(3)
    .max(100),

  telepon: z
    .string()
    .trim()
    .regex(
      /^08[0-9]{8,11}$/,
      'Nomor HP tidak valid'
    ),

  pelayanan: z.enum(
    pelayananOptions
  ),

  q1: nilaiSchema,
  q2: nilaiSchema,
  q3: nilaiSchema,
  q4: nilaiSchema,
  q5: nilaiSchema,

  saran: z
    .string()
    .trim()
    .max(1000)
    .optional(),
});

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const validation =
      surveySchema.safeParse(
        body
      );

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

    const data =
      validation.data;

    const supabase =
      await createClient();

    const { error } =
      await supabase
        .from(
          'survey_kepuasan'
        )
        .insert({
          nama: data.nama,

          telepon:
            data.telepon,

          pelayanan:
            data.pelayanan,

          q1: Number(
            data.q1
          ),

          q2: Number(
            data.q2
          ),

          q3: Number(
            data.q3
          ),

          q4: Number(
            data.q4
          ),

          q5: Number(
            data.q5
          ),

          saran:
            data.saran ||
            null,
        });

    if (error) {
      console.error(
        '[SURVEY_INSERT]',
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            'Gagal menyimpan survey',
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
          'Survey berhasil dikirim',
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      '[SURVEY_API]',
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