import { qrcode } from "https://deno.land/x/qrcode/mod.ts";

const kv = await Deno.openKv();

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
      const s = row.find((seat) => seats.indexOf(seat.id) != -1);
      if (s) selected.push(s);
    });

    console.log(selected);

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
  console.log(orderId);
  if (!value.seats) return;
  await kv.delete(key);

  if (!await seatsAvailable(value.seats)) {
    console.log("seats not available");
    return;
  }

  await updateSeats(value.seats);

  return value.seats;
}

export async function handler(req: Request, ctx) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id");
  console.log("Success", orderId);
  const seats = await completeOrderStatus(orderId);
  if (!seats) {
    return new Response("Seat is already booked. Your order ID is " + orderId, {
      status: 400,
    });
  }
  const qrCode = await qrcode(seats.join(" ") || "error", { size: 200 });
  return ctx.render({ seats, qrCode });
}

export default function Success(props) {
  return (
    <div>
      <img src={props.data.qrCode} className="rounded-sm" />
      <p>{props.data.seats.join(" ")} confirmed! Please take a screenshot</p>
    </div>
  );
}
