import { HandlerContext } from "$fresh/server.ts";
import { placeOrder } from "../../lib/razorpay.js";

const kv = await Deno.openKv();

const SEAT_HOLD_TIME = 5 * 60 * 1000;
const SEAT_LIMIT = 4;

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

    const price = selected.reduce((acc, seat) => acc + seat.price, 0);

    return {
      available: selected.every(({ hidden }) => !hidden),
      // If timestamp is less than 5 minutes before Date.now() then it is on hold
      onHold: selected.find((s) =>
        s.timestamp ? s.timestamp > Date.now() - SEAT_HOLD_TIME : false
      ),
      price,
    };
  });
}

async function lockSeats(seats: string[], order_id: string) {
  const key = ["seats", "interstellar"];
  const { value } = await kv.get(key);

  if (!value) return;

  for (const seat of seats) {
    const row = seat[0];
    value[row] = value[row].map((s) => {
      // Two things happpen here:
      // 1. If _any_ seat is already locked, we check if it has expired
      // and invalidate it if it has.
      //
      // 2. If seat selected, and we know that it is not already locked.
      // We can lock it.
      if (s.timestamp && s.timestamp < Date.now() - SEAT_HOLD_TIME) {
        console.log("Seat expired", s, Date.now());
        s.timestamp = undefined;
      }

      if (s.id == seat) {
        console.log("Locking seat", s, Date.now());
      }

      return s.id === seat ? { ...s, timestamp: Date.now(), order_id } : s;
    });
  }

  await kv.set(key, value);
}

function setOrderStatus(orderId: string, status: string, seats: string[]) {
  const key = ["orders", orderId];
  const timestamp = Date.now();
  return kv.set(key, { status, seats });
}

export const handler = async (req: Request, _ctx: HandlerContext): Response => {
  console.log("order", req.url);
  const { price, seats } = await req.json();

  if (seats.length > SEAT_LIMIT) {
    return new Response("Too many seats selected", { status: 400 });
  }

  const { available, onHold, price: expectedPrice } = await seatsAvailable(
    seats,
  );

  if (price != expectedPrice) {
    return Response.json({ error: "Price mismatch" }, { status: 400 });
  }

  if (!available) {
    return Response.json({ error: "Seat not available" }, { status: 400 });
  }

  if (onHold) {
    return Response.json({ error: "Seat on hold" }, { status: 400 });
  }

  console.log("Placing order for", seats);

  const result = await placeOrder(price);
  await setOrderStatus(result.id, "pending", seats);
  console.log("Order placed", result.id);

  await lockSeats(seats, result.id);
  console.log("Seats locked", seats);

  return Response.json(result);
};
