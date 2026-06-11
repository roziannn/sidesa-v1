import SurveyKepuasanClient from '@components/survey-kepuasan/SurveyKepuasanClient';
import { ClipboardList } from 'lucide-react';

async function getData() {
  return [
    {
      id: '1',
      nama: 'Budi Santoso',
      layanan: 'Surat Domisili',
      rating: 5,
      komentar: 'Pelayanan sangat cepat dan ramah.',
      tanggal: '2026-06-12',
    },
    {
      id: '2',
      nama: 'Siti Rahma',
      layanan: 'Pengaduan',
      rating: 4,
      komentar: 'Pengaduan ditindaklanjuti dengan baik.',
      tanggal: '2026-06-11',
    },
    {
      id: '3',
      nama: 'Agus Jaya',
      layanan: 'Surat Usaha',
      rating: 3,
      komentar: 'Proses cukup baik namun agak lama.',
      tanggal: '2026-06-10',
    },
    {
      id: '4',
      nama: 'Dewi Lestari',
      layanan: 'Surat Domisili',
      rating: 5,
      komentar: 'Sangat puas.',
      tanggal: '2026-06-09',
    },
  ];
}

export default async function SurveyKepuasanPage() {
  const data = await getData();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-sm">
          <ClipboardList className="w-5 h-5 stroke-[2.25]" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Survei Kepuasan Masyarakat
          </h1>

          <p className="text-sm text-slate-500 mt-0.5">
            Pantau hasil penilaian dan masukan warga terhadap layanan desa.
          </p>
        </div>
      </div>

      <SurveyKepuasanClient data={data} />
    </div>
  );
}