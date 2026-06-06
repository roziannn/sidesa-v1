import midtransClient from "midtrans-client";

const serverKey = process.env.MIDTRANS_SERVER_KEY;

if (!serverKey) {
  throw new Error("MIDTRANS_SERVER_KEY is not defined");
}

export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: serverKey,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
});
