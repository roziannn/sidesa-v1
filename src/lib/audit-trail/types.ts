export const AUDIT_TRAIL_TABLE = "audit_trails";

export type AuditStatus = "Berhasil" | "Gagal";

export interface AuditTrailRecord {
  id: string;
  created_at: string;
  created_by: string | null;
  user_role: string;
  module: string;
  activity: string;
  ip_address: string | null;
  status: AuditStatus;
}

export interface CreateAuditTrailInput {
  createdBy?: string | null;
  userRole: string;
  module: string;
  activity: string;
  ipAddress?: string | null;
  status: AuditStatus;
}
