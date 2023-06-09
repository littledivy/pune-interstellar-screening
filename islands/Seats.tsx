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

  //   useEffect(() => {
  //     const events = new EventSource(`/api/live-seats`);
  //     events.onmessage = (event) => {
  //       const data = JSON.parse(event.data);
  //       setSeats(data);
  //     };
  //   });

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
        seats: selectedSeats,
      }),
    });

    const { id, amount, error } = await resp.json();

    if (error) {
      alert(error);
      return;
    }

    const options = {
      // key: "rzp_test_1DP5mmOlF5G5ag",
      key: "rzp_live_jhu9tVSOEIAFCm",
      // key: "rzp_test_FeMtDa1NH5upg3",
      amount: amount,
      currency: "INR",
      name: "r/Pune Interstellar Screening",
      callback_url: window.location.origin + "/success?order_id=" + id,
      description: "Workshop screening",
      theme: {
        color: "#686CFD",
      },
      timeout: 5 * 60,
      "modal": {
        "ondismiss": function () {
          console.log("Checkout form closed");
          fetch("/api/unlock_seat", {
            method: "POST",
            body: JSON.stringify({
              id,
            }),
          });
        },
      },
      // config: {
      //   display: {
      //     hide: [{
      //       method: "upi",
      //     }],
      //   },
      // },
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  return (
    <div className="p-2">
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <div>
        <div className="container items-start pt-4">
          <h1 className="text-2xl font-bold mb-2">
            r/Pune IMAX Seat Selection
          </h1>
          <div className="float-right flex">
            <h1 className="mb-4 text-sm p-1 pr-2">
              Signed in as {email}
            </h1>
            <img
              className="rounded-full w-8 h-8 mr-2"
              src={avatar_url}
              alt="User profile picture"
            />
          </div>
        </div>

        <div className="container items-start py-4">
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
                    {seat.id.slice(1)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="container items-center no-margins pb-4">
          <div className="screen"></div>
          <p className="text-xs text-gray-400 text-center">
            All eyes this way please!
          </p>
        </div>

        <div className="fixed-div bg-blue-600  rounded drop-shadow-lg">
          <button
            className="w-full p-4 rounded-sm bg-opacity-20 backdrop-blur-lg rounded drop-shadow-lg"
            onClick={() => startCheckout()}
          >
            Checkout {price} Rs.
          </button>
        </div>
      </div>
    </div>
  );
}
