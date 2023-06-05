import { qrcode } from "https://deno.land/x/qrcode/mod.ts";
import { createHmac } from "node:crypto";

const kv = await Deno.openKv();

const HMAC_SECRET = Deno.env.get("HMAC_SECRET");
if (!HMAC_SECRET) throw new Error("HMAC_SECRET not set");

function hmacSha256(data: string): string {
  return data + "|" + createHmac("sha256", HMAC_SECRET).update(data).digest("hex");
}

export function verifyHmac(data: string): boolean {
  const [payload, hash] = data.split("|");
  return hmacSha256(payload) === data;
}

function seatsAvailable(seats: string[]) {
  const key = ["seats", "interstellar"];
  return kv.get(key).then(({ value }) => {
    // Object.values(value).find((row, { id, hidden }) => {
    //   if (id == seat && !hidden) {
    //     return true;
    //   }
    //   return false;
    // });
    let selected = [];
    Object.values(value).filter((row) => {
      const s = row.filter((seat) => seats.indexOf(seat.id) != -1);
      if (s) selected.push(...s);
    });

    if (selected.length != seats.length) {
      return false;
    }

    return selected.every(({ hidden }) => !hidden);
  });
}

async function updateSeats(seats: string[]) {
  const { value } = await kv.get(["seats", "interstellar"]);
  if (!value) return;

  for (const seat of seats) {
    const row = seat[0];
    value[row] = value[row].map((s) =>
      s.id === seat ? { ...s, hidden: true } : s
    );
  }
  const channel = new BroadcastChannel("live-seats");
  channel.postMessage(value);

  await kv.set(["seats", "interstellar"], value);
}

async function completeOrderStatus(orderId: string) {
  const key = ["orders", orderId];
  const { value } = await kv.get(key);
  if (!value) return "Order not found";
  await kv.delete(key);

  if (!await seatsAvailable(value.seats)) {
    return "Seats not available. Your order ID is " + orderId;
  }

  await updateSeats(value.seats);

  return value.seats;
}

export async function handler(req: Request, ctx) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id");
  console.log("Success", orderId);
  const seats = await completeOrderStatus(orderId);
  if (typeof seats == "string") {
    return ctx.render({ error: seats });
  }
  const qrCode = await qrcode(hmacSha256(seats.join(" ")) || "error", { size: 200 });
  return ctx.render({ seats, qrCode });
}

export default function Success(props) {
  if (props.data.error) {
    return <h2>{props.data.error}</h2>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <img src={props.data.qrCode} />
      <p>{props.data.seats.join(" ")} confirmed! Please take a screenshot</p>
    </div>
  );
}
