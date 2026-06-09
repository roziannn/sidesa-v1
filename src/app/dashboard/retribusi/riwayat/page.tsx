import { createClient } from "@/lib/supabase/server";
import RiwayatClient from '@components/retribusi/RiwayatClient';

export default async function Page() {
  const supabase = await createClient();

  const { data: transactions, error } = await supabase
    .from('transaksi')
    .select(`
      *,
      retribusi (
        jenis,
        profiles (nama, rt, rw)
      )
    `)
    .order('created_at', { ascending: false });

  return <RiwayatClient initialData={transactions || []} />;
}