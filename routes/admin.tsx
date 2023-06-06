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

  if (action === "export_pending_orders") {
    const entries = await kv.list({ prefix: ["orders"] });
    const orders = [];
    for await (const entry of entries) {
      const order = await kv.get(entry.key);
      orders.push(order);
    }
    return ctx.render({ orders });
  }

  return new Response("Unknown action", { status: 400 });
};

export default function Admin({ data }) {
  const htmlTable = data.orders.map((order) => {
    const { key, value } = order;
    const [_, order_id] = key;
    const { status, seats } = value;
    return `<tr><td>${order_id}</td><td>${status}</td><td>${
      seats.join(", ")
    }</td></tr>`;
  }).join("\n");

  return (
    <div>
      <table className="table-auto border-collapse border border-slate-500">
        <thead>
          <tr>
            <th className="border border-slate-600">Order ID</th>
            <th className="border border-slate-600">Status</th>
            <th className="border border-slate-600">Seats</th>
          </tr>
        </thead>
        <tbody>
          {data.orders.map((order) => {
            const { key, value } = order;
            const [_, order_id] = key;
            const { status, seats } = value;
            return (
              <tr>
                <td className="border border-slate-600">{order_id}</td>
                <td className="border border-slate-600">{status}</td>
                <td className="border border-slate-600">{seats.join(", ")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
