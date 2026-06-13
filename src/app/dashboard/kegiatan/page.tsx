import KegiatanClient from '@/components/kegiatan/KegiatanClient';
import { createClient } from '@/lib/supabase/server';

async function getData() {
  const supabase =
    await createClient();

  const { data } =
    await supabase
      .from('kegiatan')
      .select(`
        *,
        peserta_kegiatan(count)
      `)
      .order('tanggal');

  return data ?? [];
}

export default async function Page() {
  const data = await getData();

  return (
    <KegiatanClient
      initialData={data}
    />
  );
}