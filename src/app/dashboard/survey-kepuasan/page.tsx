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