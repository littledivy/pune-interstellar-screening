import { PageProps } from "$fresh/server.ts";
import { getAccessToken, getProfileInfo } from "../lib/google.js";
import { getCookies, setCookie } from "$std/http/cookie.ts";
import IMAXSeats from "../islands/Seats.tsx";
import { getSeats } from "./ui.tsx";

const settings = JSON.parse(Deno.env.get("SETTINGS"));
const { web } = settings;

const kv = await Deno.openKv();

export async function handler(req: Request, ctx) {
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
    seats: await getSeats(),
  });
  setCookie(response.headers, {
    name: "deploy_access_token",
    value: accessToken,
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
  });
  return response;
}

export default function Booking({ data }: PageProps) {
  return (
    <IMAXSeats
      avatar_url={data.profileInfo.picture}
      seats={data.seats}
      email={data.profileInfo.email}
    />
  );
}
