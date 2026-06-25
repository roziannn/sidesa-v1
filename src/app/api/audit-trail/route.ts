import { NextResponse } from "next/server";
import { z } from "zod";

import { createAuditTrail, getCurrentAuditActor, getIpAddressFromHeaders } from "@/lib/audit-trail/server";

const requestSchema = z.object({
  createdBy: z.string().uuid().nullable().optional(),
  userRole: z.string().trim().min(1).max(50).optional(),
  module: z.string().trim().min(1).max(100),
  activity: z.string().trim().min(1),
  status: z.enum(["Berhasil", "Gagal"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Payload audit trail tidak valid.",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const actor = await getCurrentAuditActor();

    await createAuditTrail({
      createdBy: parsed.data.createdBy ?? actor.userId,
      userRole: parsed.data.userRole ?? actor.userRole,
      module: parsed.data.module,
      activity: parsed.data.activity,
      ipAddress: getIpAddressFromHeaders(request.headers),
      status: parsed.data.status,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Audit trail error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan audit trail." },
      { status: 500 }
    );
  }
}
