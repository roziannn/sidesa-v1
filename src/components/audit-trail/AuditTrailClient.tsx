'use client';

import DataTable, { Column } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { formatDateTime } from '@/lib/format';

interface AuditTrail {
  id: string;
  waktu: string;
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
      render: (val) => formatDateTime(String(val)),
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
