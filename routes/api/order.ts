import { HandlerContext } from "$fresh/server.ts";
import { placeOrder } from "../../lib/razorpay.js";
import { getSeats, connection } from "../../lib/postgres.js";

const kv = await Deno.openKv();

const SEAT_HOLD_TIME = 5 * 60 * 1000;
const SEAT_LIMIT = 4;

async function seatsAvailable(seats: string[]) {
  const result = await connection.queryObject`
    SELECT * FROM seats
      WHERE id = ANY (${seats})
      AND NOT hidden
  `;

  const selected = result.rows;
  if (selected.length !== seats.length) return false;
  
  const price = selected.reduce((acc, seat) => acc + seat.price, 0);

    return {
      available: selected.every(({ hidden }) => !hidden),
      // If timestamp is less than 5 minutes before Date.now() then it is on hold
      onHold: selected.find((s) =>
        s.timestamp ? s.timestamp > Date.now() - SEAT_HOLD_TIME : false
      ),
      price,
    };
}

async function lockSeats(seats: string[], order_id: string) {
  const result = await connection.queryObject`
    UPDATE seats
      SET order_id = ${order_id}, timestamp = to_timestamp(${Date.now()} / 1000.0)
      WHERE id = ANY (${seats})
    `;
  console.log(result);
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
