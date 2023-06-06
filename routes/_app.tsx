import { AppProps } from "$fresh/server.ts";

export default function App({ Component }: AppProps) {
  return (
    <>
      <Component />
      {/* Footer */}
      <footer>
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8 w-full">
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
          <p className="mt-8 text-base text-gray-400">
            General T&C:{" "}
          </p>
          <li className="text-base text-gray-500">
            Tickets once confirmed cannot be refunded.
          </li>
          <li className="text-base text-gray-500">
            Be respectful and courteous to everyone in the theatre.
          </li>
          <li className="text-base text-gray-500">
            We aren't responsible for some glitch or technical issue with the
            payment or otherwise.
          </li>
          <li className="text-base text-gray-500">
            Organizers are not responsible for any kind of loss arising from the
            event. Participate at your own risk.
          </li>
          <li className="text-base text-gray-500">
            The organizers reserve the right to refuse entry to any person for
            any/no reason.
          </li>
          <li className="text-base text-gray-500">
            This service is provided as-is, without any warranty.
          </li>
          <li className="text-base text-gray-500">
            By participating in the event, you agree to abide by the above rules
            and take full responsibility for your actions.
          </li>
        </div>
      </footer>
    </>
  );
}
