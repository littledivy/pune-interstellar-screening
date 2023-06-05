import { qrcode } from "https://deno.land/x/qrcode/mod.ts";

const kv = await Deno.openKv();

async function updateSeats(seat: string) {
  const { value } = await kv.get(["seats", "interstellar"]);
  if (!value) return;

  const row = seat[0];
  value[row] = value[row].map((s) =>
    s.id === seat ? { ...s, hidden: true } : s
  );

  const channel = new BroadcastChannel("live-seats");
  channel.postMessage(value);

  await kv.set(["seats", "interstellar"], value);
}

async function completeOrderStatus(orderId: string) {
  const key = ["orders", orderId];
  const { value } = await kv.get(key);
  console.log(value);
  if (!value) return;

  await kv.delete(key);
  await updateSeats(value.seat);

  return value.seat;
}

export async function handler(req: Request, ctx) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id");
  if (req.method === "POST") {
    const seat = await completeOrderStatus(orderId);
    const qrCode = await qrcode(seat || "error", { size: 200 });
    return await ctx.render({ seat, qrCode });
  }
}

export default function Success(props) {
  return (
    <div>
      <img src={props.data.qrCode} className="rounded-sm" />
      <p>{props.data.seat} confirmed! Please take a screenshot</p>
    </div>
  );
}
