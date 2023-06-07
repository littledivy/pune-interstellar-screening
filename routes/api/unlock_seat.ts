// Anyone with an order id can hit this endpoint.
// The booking does not change, only the timestamp is reset.
// Used for the close/dismissal of checkout modal.

const kv = await Deno.openKv();
async function unlockSeats(order_id: string) {
  const key = ["seats", "interstellar"];
  const { value } = await kv.get(key);

  if (!value) return;

  for (const row of Object.keys(value)) {
    value[row] = value[row].map((s) => {
      // # Case
      //
      // Let's say the user has a 1min timeout.
      // Another user comes along and tries to book the same seat.
      // Then if the 1min timeout expires, the seat order is placed by the 2nd user.
      // but right then, the first user tries to unlock the seat!
      //
      // This could result in the first user kicking out
      // the second user from the seat.
      //
      // To mitigate this, we check if the order_id matches.
      // The second user's order_id will not match the first user's order_id
      // which is set when the first user places the order.
      if (s.order_id === order_id) {
        console.log("Explicit unlock. Seat expired", s);
        s.timestamp = undefined;
        s.order_id = undefined;
      }

      return s;
    });
  }

  await kv.set(key, value);
}

export const handler = async (req: Request): Response => {
  const { id } = await req.json();
  await unlockSeats(id);

  return new Response("ok");
};
