'use client';

import DataTable, { Column } from '@/components/DataTable';
import { Star, Trophy } from 'lucide-react';

interface SurveyKepuasan {
  id: string;
  nama: string;
  layanan: string;
  rating: number;
  komentar: string;
  tanggal: string;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-slate-300'
          }`}
        />
      ))}
    </div>
  );
}

export default function SurveyKepuasanClient({
  data,
}: {
  data: SurveyKepuasan[];
}) {
  const totalResponden = data.length;

  const rataRata =
    data.reduce((sum, item) => sum + item.rating, 0) /
    totalResponden;
const layananStats = data.reduce(
  (acc, item) => {
    if (!acc[item.layanan]) {
      acc[item.layanan] = {
        total: 0,
        count: 0,
      };
    }

    acc[item.layanan].total += item.rating;
    acc[item.layanan].count += 1;

    return acc;
  },
  {} as Record<
    string,
    {
      total: number;
      count: number;
    }
  >
);

const pelayananTerbaik =
  Object.entries(layananStats)
    .map(([layanan, stats]) => ({
      layanan,
      rataRata:
        stats.total / stats.count,
    }))
    .sort(
      (a, b) => b.rataRata - a.rataRata
    )[0]?.layanan ?? '-';

  const columns: Column<SurveyKepuasan>[] = [
    {
      label: 'Nama',
      key: 'nama',
    },
    {
      label: 'Layanan',
      key: 'layanan',
    },
    {
      label: 'Rating',
      key: 'rating',
      render: (val) => (
        <RatingStars rating={Number(val)} />
      ),
    },
    {
      label: 'Komentar',
      key: 'komentar',
    },
    {
      label: 'Tanggal',
      key: 'tanggal',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Responden
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-900">
            {totalResponden}
          </h3>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Rata-rata Rating
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-900">
            {rataRata.toFixed(1)}
          </h3>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Indeks Kepuasan
          </p>

          <h3 className="mt-2 text-3xl font-bold text-emerald-600">
            {(rataRata * 20).toFixed(0)}
          </h3>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Pelayanan Terbaik
          </p>

         <div className="mt-2 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500 fill-amber-400" />

            <h3 className="text-xl font-bold text-slate-900">
                {pelayananTerbaik}
            </h3>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
        />
      </div>
    </div>
  );
}