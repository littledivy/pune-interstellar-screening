import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";

interface SeatsProps {
}

function generateIMAXSeats(rows: number, seatsPerRow: number) {
  const seats = [];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < rows; i++) {
    for (let j = 1; j <= seatsPerRow; j++) {
      const seatId = `${alphabet[i]}${j}`;
      seats.push({ id: seatId, selected: false });
    }
  }

  return seats;
}

const seats = generateIMAXSeats(10, 10);

function getSeatStatus() {
  return seats.map((seat) => ({
    ...seat,
    status: seat.selected ? "selected" : "available",
  }));
}

function toggleSeatStatus(seatId: string) {
  const seat = seats.find((s) => s.id === seatId);
  if (seat) {
    seat.selected = !seat.selected;
    return true;
  }
  return false;
}

export default function IMAXSeats(props: SeatsProps) {
  const seatStatus = getSeatStatus();

  return (
    <div class="mb-30">
      <div class="h-70 ml-15 -rotate-45"></div>

      <h1 className="text-2xl font-bold mb-4">IMAX Seat Selection</h1>
        <div className="space-x-4">
          {seatStatus.map((seat) => (
            <button
              key={seat.id}
              onClick={() => toggleSeatStatus(seat.id)}
              className={`
                px-4 py-2 border ${
                  seat.selected
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }
              `}
              disabled={seat.selected}
            >
              {seat.id}
            </button>
          ))}
        </div>

    </div>
  );
}
