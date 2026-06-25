import type { CreateAuditTrailInput } from "./types";

export async function logAuditTrail(input: CreateAuditTrailInput) {
  const response = await fetch("/api/audit-trail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let message = "Gagal mengirim audit trail.";

    try {
      const errorBody = (await response.json()) as { error?: string };
      if (errorBody.error) {
        message = errorBody.error;
      }
    } catch {
      // Biarkan fallback message dipakai jika body response bukan JSON.
    }

    throw new Error(message);
  }
}

export async function logAuditTrailSafely(input: CreateAuditTrailInput) {
  try {
    await logAuditTrail(input);
  } catch (error) {
    console.error("Audit trail gagal disimpan:", error);
  }
}
