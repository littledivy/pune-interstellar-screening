import { PageProps } from "$fresh/server.ts";
import IMAXSeats from "../islands/Seats.tsx";
import { getSeats } from "../lib/postgres.js";

const disabled = Deno.env.get("DISABLED") === "true";
export async function handler(req: Request, ctx) {
  if (disabled) {
    return new Response("Ticket sales are closed.", {
      status: 400,
    });
  }

  return await ctx.render({ seats: await getSeats() });
}

export default function Booking(props: PageProps) {
  const seats = props.data.seats;
  return (
    <IMAXSeats
      seats={seats}
      avatar_url={"https://lh3.googleusercontent.com/a/AAcHTtdhFGc4KQwsJC-8kSjnVZ0IRcHpl4uZNcckmKhAKg=s96-c"}
      email={"dj.srivastava23@gmail.com"}
    />
  );
}
