import { createClient } from '@/lib/supabase/server';
import PengaduanClient from '@components/pengaduan/PengaduanClient';
import { FilesIcon, FileWarning } from 'lucide-react';

async function getData() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pengaduan')
    .select('*');

  console.log('ERROR:', error);
  console.log('DATA:', data);

  return data ?? [];
}
export default async function PengaduanPage() {
  const data = await getData();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center border border-emerald-100 shadow-sm">
          <FilesIcon className="w-5 h-5 stroke-[2.25]" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Daftar Pengaduan
          </h1>

          <p className="text-sm text-slate-500 mt-0.5">
            Kelola dan pantau pengaduan warga.
          </p>
        </div>
      </div>

      <PengaduanClient data={data} />
    </div>
  );
}