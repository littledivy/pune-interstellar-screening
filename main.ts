/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

const cssText = `
@import url("https://fonts.googleapis.com/css?family=Montserrat&display=swap");

@import url("https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css");

body {
	font-family: "Montserrat", sans-serif;
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
    background-color: #242333;
    color: #fff;
    margin: 0;
}

* {
	font-family: "Montserrat", sans-serif !important;
  box-sizing: border-box;
}

.movie-container {
  margin: 20px 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column
}

.movie-container select {
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  border: 0;
  padding: 5px 15px;
  margin-bottom: 40px;
  font-size: 14px;
  border-radius: 5px;
}

.container {
  perspective: 1000px;
  margin: 40px 0;
  display: flex;
  flex-direction: column;
  overflow-x: auto;
  white-space: nowrap;
  width: 100% !important;
}

.seat {
  background-color: #444451;
  height: 12px;
  width: 15px;
  margin: 3px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.selected {
  background-color: #0081cb;
}

.occupied {
  background-color: #fff;
}

.seat:nth-of-type(6) {
  margin-right: 18px;
}

.seat:nth-last-of-type(5) {
  margin-left: 18px;
}

.seat:not(.occupied):hover {
  cursor: pointer;
  transform: scale(1.2);
}

.showcase .seat:not(.occupied):hover {
  cursor: default;
  transform: scale(1);
}

.showcase {
  display: flex;
  justify-content: space-between;
  list-style-type: none;
  background: rgba(0,0,0,0.1);
  padding: 5px 10px;
  border-radius: 5px;
  color: #777;
}

.showcase li {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
}

.showcase li small {
  margin-left: 2px;
}

.c-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.screen {
  background: #fff;
  height: 70px;
  width: 70%;
  margin: 15px 0;
  transform: rotateX(-45deg);
  box-shadow: 0 3px 10px rgba(255,255,255,0.7);
}

p.text {
  margin: 40px 0;
}

p.text span {
  color: #0081cb;
  font-weight: 600;
  box-sizing: content-box;
}

.credits a {
  color: #fff;
}

.glow-green {
    box-shadow: 0 0 5px 2px rgba(0, 255, 0, 0.5);
  }
`;

await start(manifest, {
  plugins: [
    twindPlugin(twindConfig),
    {
      name: "seat-allocation",
      render(ctx) {
        const res = ctx.render();
        return {
          styles: [{ cssText, id: "__FRSH_SEATS" }],
        };
      },
    },
  ],
});
