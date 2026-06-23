'use client';

import DataTable, { Column } from '@/components/DataTable';
import { formatDate } from '@/lib/format';
import { Star, Trophy, Users, Smile } from 'lucide-react';

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
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
          }`}
        />
      ))}
    </div>
  );
}

export default function SurveyKepuasanClient({ data }: { data: SurveyKepuasan[] }) {
  const totalResponden = data.length;

  const rataRata = totalResponden > 0
    ? data.reduce((sum, item) => sum + item.average_nilai, 0) / totalResponden
    : 0;

  const layananStats = data.reduce((acc, item) => {
    if (!acc[item.pelayanan]) {
      acc[item.pelayanan] = { total: 0, count: 0 };
    }
    acc[item.pelayanan].total += item.average_nilai;
    acc[item.pelayanan].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const pelayananTerbaik = Object.entries(layananStats)
    .map(([pelayanan, stats]) => ({
      pelayanan,
      rataRata: stats.total / stats.count,
    }))
    .sort((a, b) => b.rataRata - a.rataRata)[0]?.pelayanan ?? '-';

  // Stats dengan properti bg dan color untuk gaya baru
  const stats = [
    { label: "Total Responden", value: totalResponden, icon: Users, bg: "bg-blue-50", color: "text-blue-600" },
    { label: "Rata-rata Rating", value: rataRata.toFixed(1), icon: Star, bg: "bg-amber-50", color: "text-amber-600" },
    { label: "Indeks Kepuasan", value: `${(rataRata * 20).toFixed(0)}%`, icon: Smile, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Pelayanan Terbaik", value: pelayananTerbaik, icon: Trophy, bg: "bg-purple-50", color: "text-purple-600" },
  ];

  const columns: Column<SurveyKepuasan>[] = [
    { label: 'Nama', key: 'nama' },
    { label: 'Pelayanan', key: 'pelayanan' },
    {
      label: 'Nilai',
      key: 'average_nilai',
      render: (val) => (
        <div className="flex items-center gap-2">
          <RatingStars rating={Number(val)} />
          <span className="font-medium">{Number(val).toFixed(1)}</span>
        </div>
      ),
    },
    { label: 'Saran', key: 'saran', render: (val) => String(val ?? '-') },
    { label: 'Tanggal', key: 'created_at', render: (val) => formatDate(String(val)) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-slate-500 uppercase">{stat.label}</p>
              <p className="text-xl font-semibold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}