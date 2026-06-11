'use client';

import DataTable, { Column } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';

interface AuditTrail {
  id: string;
  waktu: Date;
  pengguna: string;
  modul: string;
  aktivitas: string;
  ipAddress: string;
  status: string;
}

export default function AuditTrailClient({
  data,
}: {
  data: AuditTrail[];
}) {
  const columns: Column<AuditTrail>[] = [
    {
      label: 'Waktu',
      key: 'waktu',
      render: (val) =>
        new Date(val as Date).toLocaleString('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
    },
    {
      label: 'Pengguna',
      key: 'pengguna',
    },
    {
      label: 'Modul',
      key: 'modul',
    },
    {
      label: 'Aktivitas',
      key: 'aktivitas',
    },
    {
      label: 'IP Address',
      key: 'ipAddress',
    },
    {
      label: 'Status',
      key: 'status',
      render: (val) => (
        <StatusBadge status={String(val)} />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
    />
  );
}