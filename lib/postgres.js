import * as postgres from "https://deno.land/x/postgres@v0.14.0/mod.ts";

const databaseUrl = Deno.env.get("POSTGRES_URL");

if (!databaseUrl) {
  throw new Error("No database URL found");
}

const pool = new postgres.Pool(databaseUrl, 3, true);

export const connection = await pool.connect();

try {
  // await connection.queryObject(`DROP TABLE IF EXISTS seats`);
  await connection.queryObject`
    CREATE TABLE IF NOT EXISTS seats (
      id TEXT PRIMARY KEY,
      hidden BOOLEAN NOT NULL DEFAULT FALSE,
      selected BOOLEAN NOT NULL DEFAULT FALSE,
      price INTEGER NOT NULL DEFAULT 0,
      timestamp TIMESTAMP,
      order_id TEXT
    )
  `;
} catch (e) {
  console.log(e);
}

// Price of seat + Razorpay fee + Domain and Sendgrid fee.
const PRICE_PER_SEAT = 550 + 25;

const removedSeats = [
  // O 11 - 24
  // N 11 - 24
  ..."O".repeat(14).split("").map((c, i) => `${c}${i + 11}`),
  ..."N".repeat(14).split("").map((c, i) => `${c}${i + 11}`),

  // M 12 - 24
  ..."M".repeat(13).split("").map((m, i) => `${m}${i + 12}`),
  // L 21 - 24
  ..."L".repeat(4).split("").map((m, i) => `${m}${i + 21}`),
  // K, J, I, H 21 - 24
  ..."K".repeat(4).split("").map((m, i) => `${m}${i + 21}`),
  ..."J".repeat(4).split("").map((m, i) => `${m}${i + 21}`),
  ..."I".repeat(4).split("").map((m, i) => `${m}${i + 21}`),
  ..."H".repeat(4).split("").map((m, i) => `${m}${i + 21}`),

  // D, C, B, A 21 - 24
  ..."D".repeat(4).split("").map((m, i) => `${m}${i + 21}`),
  ..."C".repeat(4).split("").map((m, i) => `${m}${i + 21}`),
  ..."B".repeat(4).split("").map((m, i) => `${m}${i + 21}`),
  ..."A".repeat(4).split("").map((m, i) => `${m}${i + 21}`),
];

function generateIMAXSeats(rows, seatsPerRow) {
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
        price: PRICE_PER_SEAT,
        hidden: removedSeats.indexOf(seatId) != -1,
      });
    }
  }

  return seatMap;
}

export async function getSeats() {
    const result = await connection.queryObject`
      SELECT * FROM seats
    `;

    if (result.rowCount == 0) {
      const seatMap = generateIMAXSeats(15, 24);

      for (const row in seatMap) {
        for (const seat of seatMap[row]) {
          await connection.queryObject`
            INSERT INTO seats (id, hidden, selected, price)
            VALUES (${seat.id}, ${seat.hidden}, ${seat.selected}, ${seat.price})
          `;
        }
      }

      return seatMap;
    }

    const seats = {};
    for (const seat of result.rows) {
      const row = seat.id[0];
      if (!seats[row]) {
        seats[row] = [];
      }
      seats[row].push(seat);
    }

    return seats;
}

const seats = await getSeats();

