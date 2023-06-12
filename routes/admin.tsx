const kv = await Deno.openKv();

export const handler = async (req: Request, ctx): Response => {
  const secret = Deno.env.get("HMAC_SECRET")!;
  const url = new URL(req.url);
  const actual = url.searchParams.get("secret");
  if (actual !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const action = url.searchParams.get("action");
  if (action === "clear_all") {
    const entries = await kv.list({ prefix: ["orders"] });
    for await (const entry of entries) {
      await kv.delete(entry.key);
    }

    await kv.delete(["seats", "interstellar"]);
    return new Response("Deleted orders and seats");
  }

  if (action === "show_all_orders") {
    const entries = await kv.list({ prefix: ["orders"] });
    const orders = [];
    for await (const entry of entries) {
      const order = await kv.get(entry.key);
      orders.push(order);
    }
    return ctx.render({ orders });
  }

  if (action === "export_orders") {
    // Export to CSV
    const entries = await kv.list({ prefix: ["orders"] });
    const orders = [];
    for await (const entry of entries) {
      const order = await kv.get(entry.key);
      if (order.value.status !== "pending") {
        orders.push(order);
      }
    }

    const csv = orders.map(({ value: order }) => {
      const seats = order.seats.join(" ");
      return `${order.email || "-"},${order.status},${seats},${order.payment_id || "-"}`;
    }).join("\n");

    return new Response(`email,status,seats\n${csv}`, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=orders.csv",
      },
    });
  }

  return new Response("Unknown action", { status: 400 });
};

export default function Admin({ data }) {
  return (
    <div>
      <table className="table-auto border-collapse border border-slate-500">
        <thead>
          <tr>
            <th className="border border-slate-400 p-1">Order ID</th>
            <th className="border border-slate-400 p-1">Email</th>
            <th className="border border-slate-400 p-1">Status</th>
            <th className="border border-slate-400 p-1">Seats</th>
          </tr>
        </thead>
        <tbody>
          {data.orders.map((order) => {
            const { key, value } = order;
            const [_, order_id] = key;
            const { status, seats, email } = value;
            return (
              <tr>
                <td className="border border-slate-600 p-1">{order_id}</td>
                <td className="border border-slate-600 p-1">{email ?? "-"}</td>
                <td className="border border-slate-600 p-1">{status}</td>
                <td className="border border-slate-600 p-1">
                  {seats.join(", ")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
