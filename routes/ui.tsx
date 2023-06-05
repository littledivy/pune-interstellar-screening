import { PageProps } from "$fresh/server.ts";
import IMAXSeats from "../islands/Seats.tsx";

export const kv = await Deno.openKv();
await kv.delete(["seats", "interstellar"]);

const removedSeats = [
  // All of O and N
  ..."N".repeat(24).split("").map((m, i) => `${m}${i + 1}`),
  ..."O".repeat(24).split("").map((m, i) => `${m}${i + 1}`),

  // M 12 - 24
  ..."M".repeat(13).split("").map((m, i) => `${m}${i + 12}`),
  // L 20 - 24
  ..."L".repeat(5).split("").map((m, i) => `${m}${i + 20}`),
  // K, J, I, H 21 - 24
  "K".repeat(4).split("").map((m, i) => `${m}${i + 21}`),
  "J".repeat(4).split("").map((m, i) => `${m}${i + 21}`),
  "I".repeat(4).split("").map((m, i) => `${m}${i + 21}`),
  "H".repeat(4).split("").map((m, i) => `${m}${i + 21}`),

  "J18",
  "I17",
  "H15",

  // D, C, B, A 21 - 24
  ..."D".repeat(4).split("").map((m, i) => `${m}${i + 21}`),
  ..."C".repeat(4).split("").map((m, i) => `${m}${i + 21}`),
  ..."B".repeat(4).split("").map((m, i) => `${m}${i + 21}`),
  ..."A".repeat(4).split("").map((m, i) => `${m}${i + 21}`),
];

function generateIMAXSeats(rows: number, seatsPerRow: number) {
  const alphabet = "ABCDEFGHIJKLMNO".split("").reverse().join("");
  const seatMap = {};

  for (let i = 0; i < rows; i++) {
    const row = alphabet[i];
    seatMap[row] = [];

    for (let j = seatsPerRow; j >= 1; j--) {
      const seatId = `${row}${j}`;

      seatMap[row].push({
        id: seatId,
        selected: false,
        price: 5,
        hidden: removedSeats.indexOf(seatId) != -1,
      });
    }
  }

  return seatMap;
}

export async function getSeats() {
  const key = ["seats", "interstellar"];
  const { value } = await kv.get(key);
  if (value) return value;

  const seats = generateIMAXSeats(15, 24);
  await kv.set(key, seats);
  return seats;
}

export async function handler(req: Request, ctx) {
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
