import { HandlerContext } from "$fresh/server.ts";
import { placeOrder } from "../../lib/razorpay.js";

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
    const selected = Object.values(value).filter((row, { id }) =>
      seats.includes(id)
    );
    return selected.every(({ hidden }) => !hidden);
  });
}

function setOrderStatus(orderId: string, status: string, seats: string[]) {
  const key = ["orders", orderId];
  return kv.set(key, { status, seats });
}

export const handler = async (req: Request, _ctx: HandlerContext): Response => {
  console.log("order", req.url);
  const { price, seats } = await req.json();

  if (!await seatsAvailable(seats)) {
    return new Response("Seat not available", { status: 400 });
  }

  console.log("Placing order for", seats);
  const result = await placeOrder(price);
  console.log("Order placed", result);
  await setOrderStatus(result.id, "pending", seats);
  console.log("Order placed", result.id);

  return Response.json(result);
};
