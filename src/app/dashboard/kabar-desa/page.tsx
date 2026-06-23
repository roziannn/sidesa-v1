import { createClient } from '@/lib/supabase/server';
import KabarDesaClient from '@components/kabar-desa/KabarDesaClient';

export default async function KabarDesaPage() {
  const supabase = await createClient();

  const { data: kabar, error } = await supabase
  .from('kabar_desa')
  .select('*, profiles(nama)')
  .order('created_at', { ascending: false });

// Tambahkan ini untuk debugging:
console.log("Data dari Supabase:", kabar);

  if (error) throw new Error(error.message);

  return <KabarDesaClient initialData={kabar || []} />;
}