import { Handlers, RouteConfig } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(_req, ctx) {
    const channel = new BroadcastChannel("live-seats");

    const stream = new ReadableStream({
      start: (controller) => {
        channel.addEventListener("message", (message) => {
          const body = `data: ${JSON.stringify(message.data)}\n\n`;
          controller.enqueue(body);
        });
      },
      cancel() {
        channel.close();
      },
    });

    return new Response(stream.pipeThrough(new TextEncoderStream()), {
      headers: { "content-type": "text/event-stream" },
    });
  },
};
