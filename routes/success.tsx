import { qrcode } from "https://deno.land/x/qrcode/mod.ts";
import { createHmac } from "node:crypto";
import { sendSimpleMail } from "../lib/smtp.js";
import { getCookies, setCookie } from "$std/http/cookie.ts";
import { getProfileInfo } from "../lib/google.js";
import { capturePayment, instantRefund } from "../lib/razorpay.js";

const kv = await Deno.openKv();

const HMAC_SECRET = Deno.env.get("HMAC_SECRET");
if (!HMAC_SECRET) throw new Error("HMAC_SECRET not set");

function hmacSha256(data: string): string {
  return data + "|" +
    createHmac("sha256", HMAC_SECRET).update(data).digest("hex");
}

export function verifyHmac(data: string): boolean {
  const [payload, hash] = data.split("|");
  return hmacSha256(payload) === data;
}

function seatsAvailable(seats: string[]) {
  const key = ["seats", "interstellar"];
  return kv.get(key).then(({ value }) => {
    // Object.values(value).find((row, { id, hidden }) => {
    //   if (id == seat && !hidden) {
    //     return true;
    //   }
    //   return false;
    // });
    let selected = [];
    Object.values(value).filter((row) => {
      const s = row.filter((seat) => seats.indexOf(seat.id) != -1);
      if (s) selected.push(...s);
    });

    if (selected.length != seats.length) {
      return false;
    }

    const price = selected.reduce((acc, seat) => acc + seat.price, 0);
    return {
      available: selected.every(({ hidden }) => !hidden),
      price,
    };
  });
}

async function updateSeats(seats: string[]) {
  const { value } = await kv.get(["seats", "interstellar"]);
  if (!value) return;

  for (const seat of seats) {
    const row = seat[0];
    value[row] = value[row].map((s) =>
      s.id === seat ? { ...s, hidden: true } : s
    );
  }
  const channel = new BroadcastChannel("live-seats");
  channel.postMessage(value);

  await kv.set(["seats", "interstellar"], value);
}

async function completeOrderStatus(
  orderId: string,
  paymentId: string,
  email?: string,
) {
  const key = ["orders", orderId];
  const { value } = await kv.get(key);
  if (!value) return "Order not found";
  if (value.status === "paid") return "Order already paid";
  const { price, available } = await seatsAvailable(value.seats);

  if (!available) {
    // Instant-refund
    // const res = await instantRefund(paymentId, price);
    // if (res.error) {
    //   console.error("Instant Refund failed", res.error);
    //   return "Seats not available. Refund is initiated and will be processed in ~5 business days. Your order ID is " + orderId;
    // }
    // return "Seats not available. Refund initiated, refund ID is " + res.id + ". Your order ID is " + orderId;

    await kv.set(key, {
      ...value,
      payment_id: paymentId,
      status: "refund",
      email,
    });
    return "Seats not available. Refund is initiated and will be processed in ~5 business days. Your order ID is " +
      orderId;
  }

  await kv.set(key, { ...value, payment_id: paymentId, status: "paid", email });
  try {
    console.log(await capturePayment(paymentId, price));
  } catch (e) {
    console.error("Capture payment failed", e);
  }
  await updateSeats(value.seats);

  return value.seats;
}

const disabled = Deno.env.get("DISABLED") === "true";
export async function handler(req: Request, ctx) {
  if (disabled) {
    return new Response("Booking is disabled!", { status: 503 });
  }

  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id");

  let paymentId;
  let profileInfo;
  try {
    const formData = await req.formData();
    paymentId = formData.get("razorpay_payment_id");

    const accessToken = getCookies(req.headers)["deploy_access_token"];
    profileInfo = await getProfileInfo(accessToken);
  } catch (_) {
    return ctx.render({ error: "Invalid request" });
  }

  if (!paymentId) {
    return new Response("Payment ID not found", { status: 400 });
  }

  const seats = await completeOrderStatus(
    orderId,
    paymentId,
    profileInfo.email,
  );
  if (typeof seats == "string") {
    return ctx.render({ error: seats });
  }

  const qrCode = await qrcode(hmacSha256(seats.join(" ")) || "error", {
    size: 200,
  });

  let email;
  try {
    email = await sendSimpleMail({
      From: "admin@ticketmagic.fun",
      To: profileInfo.email,
      Subject: "Your Interstellar IMAX ticket",
      HtmlBody:
        "<h1>r/Pune Interstellar IMAX</h1><p>Thank you for booking seat(s) " +
        seats.join(" ") +
        ". Here is your booking QR. Do not share this with anyone.</p><br><p>Join this new WhatsApp group for further updates: <a href='https://chat.whatsapp.com/C0tAGHQtI2k93R3LiiwUJN'>https://chat.whatsapp.com/C0tAGHQtI2k93R3LiiwUJN</a></p>",
      Attachments: [
        {
          Content: qrCode.split(",")[1],
          Name: "ticket_qr.gif",
          ContentType: "image/gif",
          ContentDisposition: "inline",
        },
      ],
    });

    console.log(email);
  } catch (e) {
    console.error(e);
  }

  return ctx.render({
    seats,
    qrCode,
    emailSent: email?.ErrorCode === 0,
    email: profileInfo?.email,
  });
}

export default function Success(props) {
  if (props.data.error) {
    return (
      <div
        class="relative z-10"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
        </div>
        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex justify-center p-4 text-center sm:items-center sm:p-0">
            <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div>
                  <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      class="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3
                      class="text-base font-semibold leading-6 text-gray-900"
                      id="modal-title"
                    >
                      Booking failed
                    </h3>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500">{props.data.error}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <a
                  href="/"
                  class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                >
                  Book again.
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div class="ticket-system text-gray-700">
        <div class="top">
          <div class="printer" />
        </div>
        <div class="receipts-wrapper">
          <div class="receipts">
            <div class="receipt">
              <div class="details">
                <div class="item">
                  <span>Screening</span>
                  <h3>Interstellar</h3>
                </div>
                <div class="item">
                  <span>Screen</span>
                  <h3>AUDI04</h3>
                </div>
                <div class="item">
                  <span>Date</span>
                  <h3>25/06/2023 12:45</h3>
                </div>
                <div class="item">
                  <span>Gate Closes</span>
                  <h3>12:30</h3>
                </div>
                <div class="item">
                  <span>Venue</span>
                  <h3>Cinepolis: Nexus WESTEND Mall, Aundh</h3>
                </div>
                <div class="item">
                  <span>Seats</span>
                  <h3>{props.data.seats.join(" ")}</h3>
                </div>
              </div>
            </div>
            <div class="receipt qr-code">
              <img src={props.data.qrCode} className="qr" />
              <div class="description">
                {props.data.emailSent && <p>{props.data.email}</p>}

                <p className="pt-2">Show QR-code when requested</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p>
        {props.data.emailSent && "Email Sent."} Please{" "}
        {props.data.emailSent && "also"} take a screenshot.
      </p>
    </div>
  );
}
