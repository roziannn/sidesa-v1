'use client';
import React, { useState, useMemo } from 'react';
import DataTable, { Column } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { formatRupiah, formatDate } from '@/lib/format';

export default function RiwayatClient({ initialData }: { initialData: any[] }) {
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const summary = useMemo(() => {
    const totalPemasukan = initialData
      .filter(t => t.status === 'success')
      .reduce((acc, curr) => acc + (curr.jumlah || 0), 0);
    
    const berhasil = initialData.filter(t => t.status === 'success').length;
    const gagal = initialData.filter(t => ['failed', 'expired'].includes(t.status)).length;
    const rataRata = berhasil > 0 ? totalPemasukan / berhasil : 0;

    return { totalPemasukan, berhasil, gagal, rataRata };
  }, [initialData]);

 const formatMethod = (method: string | null | undefined) => {
  if (!method) return "-";
  
  return method
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
const columns: Column<any>[] = [
  { label: "Tanggal", key: "created_at", render: (val) => formatDate(val as string) },
  { 
    label: "Warga", 
    key: "warga", 
    render: (_, row) => (
      <div className="font-semibold">{row.retribusi?.profiles?.nama || '-'}</div>
    ) 
  },
  { 
    label: "RT / RW", 
    key: "rt_rw", 
    render: (_, row) => (
      <span className="text-slate-600 font-medium">
        {row.retribusi?.profiles?.rt || '-'}/{row.retribusi?.profiles?.rw || '-'}
      </span>
    ) 
  },
  { label: "Jenis", key: "jenis", render: (_, row) => row.retribusi?.jenis || '-' },
  { label: "Jumlah", key: "jumlah", render: (val) => <span className="font-bold">{formatRupiah(val as number)}</span> },
{ 
  label: "Metode", 
  key: "metode_bayar",
  render: (val) => (
    <span className="text-sm text-slate-700 font-medium">
      {formatMethod(val as string || "")}
    </span>
  )
},
  { label: "Status", key: "status", render: (val) => <StatusBadge status={val as string} /> },
];

  return (
    <div className="space-y-6">
      {/* SUMMARY BAR */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Pemasukan", value: formatRupiah(summary.totalPemasukan) },
          { label: "Transaksi Berhasil", value: summary.berhasil },
          { label: "Gagal/Expired", value: summary.gagal },
          { label: "Rata-rata/Transaksi", value: formatRupiah(summary.rataRata) },
        ].map((item, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">{item.label}</p>
            <p className="text-lg font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* TABEL */}
      <DataTable 
        columns={columns} 
        data={initialData} 
        onView={(row) => setSelectedRow(row)} 
      />

      {/* MODAL DETAIL (Sederhana) */}
      {selectedRow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
            <h2 className="font-bold text-lg mb-4">Detail Transaksi</h2>
            <div className="space-y-3 text-sm">
              <p><strong>Order ID:</strong> {selectedRow.midtrans_order_id}</p>
              <p><strong>Waktu Webhook:</strong> {formatDate(selectedRow.updated_at)}</p>
              <div className="bg-slate-900 text-green-400 p-4 rounded text-xs font-mono overflow-auto max-h-60">
                {JSON.stringify(selectedRow.raw_response, null, 2)}
              </div>
            </div>
            <button 
              onClick={() => setSelectedRow(null)}
              className="mt-6 w-full py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}