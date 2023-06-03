import { PageProps } from "$fresh/server.ts";
import { getAccessToken, getProfileInfo } from "../lib/google.js";
import { getCookies, setCookie } from "$std/http/cookie.ts";
import IMAXSeats from "../islands/Seats.tsx";

import settings from "../settings.json" assert { type: "json" };
const { web } = settings;

export async function handler(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return new Response("Unauthorised", { status: 400 });
  }

  const accessToken = await getAccessToken(
    web.client_id,
    web.client_secret,
    web.redirect_uris[0],
    code,
  );
  const profileInfo = await getProfileInfo(accessToken);

  const response = await ctx.render({
    profileInfo,
  });
  setCookie(response.headers, {
    name: "deploy_access_token",
    value: accessToken,
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
  });
}

export default function Booking(props: PageProps) {
  return <IMAXSeats />;
}
