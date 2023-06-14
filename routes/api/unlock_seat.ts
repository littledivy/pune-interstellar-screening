// Anyone with an order id can hit this endpoint.
// The booking does not change, only the timestamp is reset.
// Used for the close/dismissal of checkout modal.

import { connection } from "../../lib/postgres.js";

async function unlockSeats(order_id: string) {
  const result = await connection.queryObject`
    UPDATE seats
      SET order_id = null, timestamp = null
      WHERE order_id = ${order_id}
  `;
  console.log(result);
}

export const handler = async (req: Request): Response => {
  const { id } = await req.json();
  await unlockSeats(id);

  return new Response("ok");
};
