import { verifyHmac } from "../success.tsx";

export const handler = async (req: Request): Response => {
  const { scan } = await req.json();
  const verified = await verifyHmac(scan.data);
  const text = scan.data.split("|")[0];
  return Response.json({ verified, text });
};
