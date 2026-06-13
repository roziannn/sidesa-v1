'use client';

import DataTable, { Column } from '@/components/DataTable';
import { formatDate } from '@/lib/format';
import { Star, Trophy } from 'lucide-react';

 interface SurveyKepuasan {
  id: number;
  nama: string;
  pelayanan: string;
  average_nilai: number;
  saran: string | null;
  created_at: string;
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

  const rataRata = totalResponden > 0
    ? data.reduce( (sum, item) =>
          sum + item.average_nilai,
        0
      ) / totalResponden
    : 0;
const layananStats = data.reduce(
  (acc, item) => {
    if (!acc[item.pelayanan]) {
      acc[item.pelayanan] = {
        total: 0,
        count: 0,
      };
    }

    acc[item.pelayanan].total += item.average_nilai;
    acc[item.pelayanan].count += 1;

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
    .map(
      ([pelayanan, stats]) => ({
        pelayanan,
        rataRata:
          stats.total /
          stats.count,
      })
    )
    .sort(
      (a, b) =>
        b.rataRata -
        a.rataRata
    )[0]?.pelayanan ?? '-';

 const columns: Column<SurveyKepuasan>[] = [
  {
    label: 'Nama',
    key: 'nama',
  },
  {
    label: 'Pelayanan',
    key: 'pelayanan',
  },
  {
    label: 'Nilai',
    key: 'average_nilai',
    render: (val) => (
      <div className="flex items-center gap-2">
        <RatingStars rating={Number(val)} />
        <span className="font-medium">
          {Number(val).toFixed(1)}
        </span>
      </div>
    ),
  },
  {
    label: 'Saran',
    key: 'saran',
    render: (val) => String(val ?? '-')
  },
  {
    label: 'Tanggal',
    key: 'created_at',
    render: (val) => formatDate(String(val)),
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

        <DataTable
          columns={columns}
          data={data}
        />
      </div>
  );
}