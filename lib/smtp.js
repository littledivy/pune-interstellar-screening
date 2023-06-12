const SMTP_SERVICE = "https://smtp-service-sooty.vercel.app/api/handler";

// Sendgrid sucks :<
export async function sendSimpleMail(r) {
  const response = await fetch(SMTP_SERVICE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...r,
      apiKey: Deno.env.get("SMTP_API_KEY"),
    }),
  });

  return response.json();
}

