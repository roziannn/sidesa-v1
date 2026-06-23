'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/DataTable';
import { Newspaper, FileText, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import StatusBadge from '@components/StatusBadge';
import { formatShortDate } from '@/lib/format';
import { supabaseClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/useToast';
import Button from '@components/ui/Button';

export default function KabarDesaClient({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const router = useRouter();
  const { showToast } = useToast();

  const kategoriCounts = data.reduce((acc: any, curr: any) => {
    const kat = curr.kategori || 'Lainnya';
    acc[kat] = (acc[kat] || 0) + 1;
    return acc;
  }, {});

  const topKategori = Object.entries(kategoriCounts).sort((a: any, b: any) => b[1] - a[1])[0];
  const labelKategori = topKategori ? (topKategori[0] as string).toUpperCase() : "-";
  const valKategori = topKategori ? (topKategori[1] as number) : 0;

  const stats = [
    { label: "Total Kabar", value: data.length, icon: <Newspaper className="w-6 h-6" />, bg: "bg-blue-50", color: "text-blue-600" },
    { label: "Published", value: data.filter(d => d.status === 'published').length, icon: <CheckCircle2 className="w-6 h-6" />, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Draft", value: data.filter(d => d.status === 'draft').length, icon: <AlertCircle className="w-6 h-6" />, bg: "bg-amber-50", color: "text-amber-600" },
    { label: "Kategori Utama", value: valKategori, subValue: labelKategori, icon: <FileText className="w-6 h-6" />, bg: "bg-purple-50", color: "text-purple-600" },
  ];

  const columns: Column<any>[] = [
    { label: 'Judul', key: 'judul' },
    { label: 'Kategori', key: 'kategori' },
    { 
      label: 'Status', 
      key: 'status',
      render: (val) => <StatusBadge status={String(val)} />
    },
    { 
      label: 'Tampil di Landing', 
      key: 'is_displayed',
      render: (val) => val ? 'Aktif' : 'Tidak' 
    },
    { 
      label: 'Dibuat', 
      key: 'created_at', 
      render: (val) => formatShortDate(String(val)) 
    },
    { 
      label: 'Author', 
      key: 'profiles', 
      render: (val: any) => val?.nama || 'Tidak ada nama' 
    },
  ];

  const handleEdit = (row: any) => router.push(`/dashboard/kabar-desa/${row.id}/edit`);

  const handleArchive = async (row: any) => {
    const isArchived = row.status === 'archived';
    const newStatus = isArchived ? 'draft' : 'archived';
    const actionName = isArchived ? 'memulihkan' : 'mengarsipkan';

    if (confirm(`Yakin ingin ${actionName} kabar "${row.judul}"?`)) {
      const { error } = await supabaseClient
        .from('kabar_desa')
        .update({ status: newStatus })
        .eq('id', row.id);

      if (error) {
        showToast('error', 'Gagal', `Gagal ${actionName} data.`);
        return;
      }

      showToast('success', 'Berhasil', `Data berhasil ${isArchived ? 'dipulihkan' : 'diarsipkan'}.`);
      setData(data.map((item) => item.id === row.id ? { ...item, status: newStatus } : item));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kabar Desa</h1>
          <p className="text-sm text-slate-500 mt-1">Pusat manajemen konten dan informasi resmi desa.</p>
        </div>
        <Button variant="primary" onClick={() => router.push('/dashboard/kabar-desa/create')} leftIcon={<Plus className="h-4 w-4" />}>
          Tambah Kabar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-semibold text-[#1B4332]">{stat.value}</p>
                {(stat as any).subValue && (
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{(stat as any).subValue}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        onEdit={handleEdit} 
        onArchive={handleArchive}    
      />
    </div>
  );
}