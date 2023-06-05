import { Head } from "$fresh/runtime.ts";
const settings = JSON.parse(Deno.env.get("SETTINGS"));

const { web } = settings;
let google_oauth_url = new URL("https://accounts.google.com/o/oauth2/auth");
google_oauth_url.searchParams.set(
  "scope",
  "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
);
google_oauth_url.searchParams.set("redirect_uri", Deno.env.get("GOOGLE_REDIRECT_URL") || web.redirect_uris[0]);
google_oauth_url.searchParams.set("response_type", "code");
google_oauth_url.searchParams.set("client_id", web.client_id);
google_oauth_url.searchParams.set("access_type", "online");

export default function Home() {
  return (
    <>
      <Head>
        <title>r/Pune Interstellar Screening</title>
      </Head>
      <div>
        <h1 className="text-2xl font-bold mb-4">r/Pune IMAX Seat Selection</h1>
        <div class="px-6 sm:px-0 max-w-sm">
          <a
            type="button"
            class="text-white w-full  bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between dark:focus:ring-[#4285F4]/55 mr-2 mb-2"
            href={google_oauth_url}
          >
            <svg
              class="mr-2 -ml-1 w-4 h-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              >
              </path>
            </svg>Sign up with Google<div></div>
          </a>
        </div>
      </div>
    </>
  );
}
