import { Head } from "$fresh/runtime.ts";
import settings from "../settings.json" assert { type: "json" };

export async function handler(req: Request) {
  const { web } = settings;
  let google_oauth_url = new URL('https://accounts.google.com/o/oauth2/auth');
  google_oauth_url.searchParams.set('scope', 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');
  google_oauth_url.searchParams.set('redirect_uri', web.redirect_uris[0]);
  google_oauth_url.searchParams.set('response_type', 'code');
  google_oauth_url.searchParams.set('client_id', web.client_id);
  google_oauth_url.searchParams.set('access_type', 'online');

  return Response.redirect(google_oauth_url, 302);
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <img
          src="/logo.svg"
          class="w-32 h-32"
          alt="the fresh logo: a sliced lemon dripping with juice"
        />
        <p class="my-6">
          Welcome to `fresh`. Try updating this message in the
          ./routes/index.tsx file, and refresh.
        </p>
      </div>
    </>
  );
}
