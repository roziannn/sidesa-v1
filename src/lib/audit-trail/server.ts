import "server-only";

import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import {
  AUDIT_TRAIL_TABLE,
  type AuditTrailRecord,
  type CreateAuditTrailInput,
} from "./types";

const auditTrailSchema = z.object({
  createdBy: z.string().uuid().nullable().optional(),
  userRole: z.string().trim().min(1).max(50),
  module: z.string().trim().min(1).max(100),
  activity: z.string().trim().min(1),
  ipAddress: z.string().trim().max(255).nullable().optional(),
  status: z.enum(["Berhasil", "Gagal"]),
});

function sanitizeIpAddress(value: string | null | undefined) {
  if (!value) return null;

  const firstIp = value.split(",")[0]?.trim();
  return firstIp || null;
}

export function getIpAddressFromHeaders(headers: Headers) {
  return sanitizeIpAddress(
    headers.get("x-forwarded-for") ??
      headers.get("x-real-ip") ??
      headers.get("cf-connecting-ip")
  );
}

export async function createAuditTrail(input: CreateAuditTrailInput) {
  console.log("DEBUG: Input yang diterima API:", JSON.stringify(input, null, 2));
  const payload = auditTrailSchema.parse(input);
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin.from(AUDIT_TRAIL_TABLE).insert({
    created_by: payload.createdBy ?? null,
    user_role: payload.userRole,
    module: payload.module,
    activity: payload.activity,
    ip_address: payload.ipAddress ?? null,
    status: payload.status,
  });

  if (error) {
    throw new Error(`Gagal menyimpan audit trail: ${error.message}`);
  }
}

export async function getCurrentAuditActor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      userRole: "guest",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    userRole: profile?.role ?? "user",
  };
}

export async function listAuditTrails(limit = 100) {
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from(AUDIT_TRAIL_TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Gagal mengambil audit trail: ${error.message}`);
  }

  return (data ?? []) as AuditTrailRecord[];
}
