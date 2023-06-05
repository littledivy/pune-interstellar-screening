import { HandlerContext } from "$fresh/server.ts";
import { placeOrder } from "../../lib/razorpay.js";

const kv = await Deno.openKv();

function seatAvailable(seat: string) {
  const key = ["seats", "interstellar"];
  return kv.get(key).then(({ value }) => {
    Object.values(value).find((row, { id, hidden }) => {
      if (id == seat && !hidden) {
        return true;
      }
      return false;
    });
  });
}

function setOrderStatus(orderId: string, status: string, seat: string) {
  const key = ["orders", orderId];
  return kv.set(key, { status, seat });
}

export const handler = async (req: Request, _ctx: HandlerContext): Response => {
  const { price, seat } = await req.json();

  if (!seatAvailable(seat)) {
    return new Response("Seat not available", { status: 400 });
  }

  const result = await placeOrder(price);
  console.log(result, seat);
  await setOrderStatus(result.id, "pending", seat);

  return Response.json(result);
};
