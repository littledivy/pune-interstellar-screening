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
@media (max-width: 576px) {
  body { display: block; }
}
@media (min-width: 576px) {
::-webkit-scrollbar-track
{
	-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
	border-radius: 10px;
}
::-webkit-scrollbar
{
	width: 6px;
}
::-webkit-scrollbar-thumb
{
	border-radius: 5px;
  background-color: #555;
}

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

.fixed-div {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  color: white;
  text-align: center;
}

.bg-gray {
  background-color: #444451;
  color: #fff;
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
  display: flex;
  flex-direction: column;
  overflow-x: auto;
  white-space: nowrap;
  width: 100% !important;
}

.seat {
  background-color: #444451;
  height: 27px;
  width: 30px;
  margin: 3px;
  border-radius: 5px;
  text-align: center;
  justify-content: center;
  font-size: 15px;
  line-height: 27px;
  font-weight: bold;
  scrollbar-width: none;
}

.selected {
  background-color: #0081cb;
}

.occupied {
  background-color: #fff;
  color: #000;
}

.reserved {
  /* Fade out the reserved seats */
  background-color: #444451;
  opacity: 0.38;
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
  transform: rotateX(45deg);
  box-shadow: 0 3px 10px rgba(255,255,255,0.7);
}

.no-margins {
  margin: 0 !important;
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
