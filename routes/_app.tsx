import { AppProps } from "$fresh/server.ts";

export default function App({ Component }: AppProps) {
  return (
    <>
      <Component />
      {/* Footer */}
      <footer>
        <div className="max-w-7xl mx-auto pb-24 px-4 overflow-hidden sm:px-6 lg:px-8 w-full">
          <nav
            className="-mx-5 -my-2 py-2 flex flex-wrap justify-center"
            aria-label="Footer"
          >
            <div className="px-5 py-2">
              <aria-label className="text-base text-gray-500">
                Made with ❤️ by{"  "}littledivy and r/Pune volunteers
              </aria-label>
            </div>
          </nav>
        </div>
      </footer>
    </>
  );
}
