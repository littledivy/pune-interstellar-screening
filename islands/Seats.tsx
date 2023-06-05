import { useEffect, useState } from "preact/hooks";

type SeatsProps = {
  email: string;
  avatar_url: string;
  seats: any;
};

export default function IMAXSeats(props: SeatsProps) {
  const { seats: s, email, avatar_url } = props;
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [price, setPrice] = useState<number>(0);
  const [seats, setSeats] = useState<any>(s);

  useEffect(() => {
    const events = new EventSource(`/api/live-seats`);
    events.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSeats(data);
    };
  });

  const availableSeatsCount = Object.values(seats)
    .flat()
    .filter((seat) => !seat.selected && !seat.hidden).length;

  const handleSeatToggle = (seatId: string, p: number) => {
    const index = selectedSeats.indexOf(seatId);
    if (index > -1) {
      const updatedSeats = [...selectedSeats];
      updatedSeats.splice(index, 1);
      setSelectedSeats(updatedSeats);

      setPrice(price - p);
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
      setPrice(price + p);
    }
  };

  const startCheckout = async () => {
    const resp = await fetch("/api/order", {
      method: "POST",
      body: JSON.stringify({
        price,
        seat: selectedSeats[0],
      }),
    });

    const { id, amount } = await resp.json();

    const options = {
      key: "rzp_test_1DP5mmOlF5G5ag",
      amount: amount,
      currency: "INR",
      name: "r/Pune Interstellar",
      callback_url: window.location.origin + "/success?order_id=" + id,
      description: "Test Transaction",
      theme: {
        color: "#686CFD",
      },
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  return (
    <div>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <h1 className="text-2xl font-bold mb-4">r/Pune IMAX Seat Selection</h1>
      <div className="float-right flex">
        <h1 className="mb-4 text-sm p-1 pr-2">
          Signed in as {email}
        </h1>
        <img
          className="rounded-full w-8 h-8 mr-2"
          src={avatar_url}
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
                return (
                  <div
                    onClick={() =>
                      !seat.hidden && handleSeatToggle(seat.id, seat.price)}
                    className={`seat${
                      seat.selected
                        ? " occupied"
                        : (selectedSeats.indexOf(seat.id) > -1
                          ? " occupied glow-green"
                          : "")
                    }${seat.hidden ? " reserved" : ""}`}
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
            Available Seats: {availableSeatsCount}
          </p>
          <p className="text-lg">
            Price: {price + 15} Rs.
          </p>
        </div>
        <button
          className="bg-blue-400 float-right p-2 rounded-sm"
          onClick={() => startCheckout()}
        >
          Checkout {price + 15} Rs.
        </button>
      </div>
    </div>
  );
}
