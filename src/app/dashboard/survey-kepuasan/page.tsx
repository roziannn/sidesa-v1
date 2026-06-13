import SurveyKepuasanClient from '@components/survey-kepuasan/SurveyKepuasanClient';
import { ClipboardList } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';

async function getData() {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from('survey_kepuasan')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

  if (error) {
    console.error(
      '[SURVEY_GET]',
      error
    );

    return [];
  }

  return data;
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