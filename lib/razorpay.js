export const API_ID = Deno.env.get("API_ID");
export const API_KEY = Deno.env.get("API_KEY");

console.log("Razorpay API_ID: ", API_ID.slice(0, 4).concat("*".repeat(API_ID.length - 4)));
console.log("Razorpay API_KEY: ", API_KEY.slice(0, 4).concat("*".repeat(API_KEY.length - 4)));

export async function placeOrder(amount) {
  const resp = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(API_ID + ":" + API_KEY)}`,
    },
    body: JSON.stringify({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt#1",
    }),
  });

  return resp.json();
}
