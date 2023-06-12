const POSTMARK_API = "https://api.postmarkapp.com/email";

export async function sendSimpleMail(r) {
  const response = await fetch(POSTMARK_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": Deno.env.get("POSTMARK_SERVER_TOKEN"),
      "Accept": "application/json",
    },
    body: JSON.stringify(r),
  });

  return response.json();
}

