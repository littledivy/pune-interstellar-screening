import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";

function generateIMAXSeats(rows: number, seatsPerRow: number) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const seatMap = {};

  for (let i = 0; i < rows; i++) {
    const row = alphabet[i];
    seatMap[row] = [];

    for (let j = 1; j <= seatsPerRow; j++) {
      const seatId = `${row}${j}`;
      seatMap[row].push({ id: seatId, selected: false, price: 550 });
    }
  }

  return seatMap;
}

const seats = generateIMAXSeats(14, 17 + 25 + 17);

type SeatsProps = {
  email: string;
  avatar_url: string;
};

export default function IMAXSeats(props: SeatsProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [price, setPrice] = useState<number>(0);

  const availableSeatsCount = Object.values(seats)
    .flat()
    .filter((seat) => !seat.selected).length;

  const handleSeatToggle = (seatId: string, p: number) => {
    const index = selectedSeats.indexOf(seatId);
    if (index > -1) {
      const updatedSeats = [...selectedSeats];
      updatedSeats.splice(index, 1);
      setSelectedSeats(updatedSeats);
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }

    setPrice(price + p);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">r/Pune IMAX Seat Selection</h1>
      <div className="float-right flex">
        <h1 className="mb-4 text-sm p-1 pr-2">
          Signed in as dj.srivastava23@gmail.com
        </h1>
        <img
          className="rounded-full w-8 h-8 mr-2"
          src={"https://lh3.googleusercontent.com/a/AAcHTtdhFGc4KQwsJC-8kSjnVZ0IRcHpl4uZNcckmKhAKg=s96-c"}
        />
      </div>

      <div className="container items-center">
        <div className="screen"></div>
      </div>
      <div>
        <div className="container items-start pb-12">
          {Object.entries(seats).map(([row, seats]) => (
            <div className="c-row">
              {seats.map((seat) => {
                console.log(selectedSeats);
                return (
                  <div
                    onClick={() => handleSeatToggle(seat.id, seat.price)}
                    className={`seat${
                      seat.selected
                        ? " occupied"
                        : (selectedSeats.indexOf(seat.id) > -1
                          ? " occupied glow-green"
                          : "")
                    }`}
                  >
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="container">
          <p className="text-lg">
            Selected Seats: {selectedSeats.join(", ")}
          </p>
          <p className="text-lg">
            Available Seats: {availableSeatsCount} /{" "}
            {Object.values(seats).flat().length}
          </p>
        </div>
        <button className="bg-blue-400 float-right p-2 rounded-sm">
          Checkout {price} Rs.
        </button>
      </div>
    </div>
  );
}
