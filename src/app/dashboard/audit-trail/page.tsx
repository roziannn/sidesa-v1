import AuditTrailClient from '@/components/audit-trail/AuditTrailClient';
import { listAuditTrails } from '@/lib/audit-trail/server';

async function getData() {
  const records = await listAuditTrails();

  return records.map((item) => ({
    id: item.id,
    waktu: item.created_at,
    pengguna: item.user_role,
    modul: item.module,
    aktivitas: item.activity,
    ipAddress: item.ip_address ?? '-',
    status: item.status,
  }));
}

export default async function AuditTrailPage() {
  const data = await getData();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Riwayat aktivitas pengguna dalam sistem.
          </p>
        </div>
      </div>

      <AuditTrailClient data={data} />
    </div>
  );
}
