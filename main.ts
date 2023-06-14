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

.c-button {
  backdrop-filter: blur(10px);
}

.context {
    width: 100%;
    position: absolute;
    top:50vh;
    
}

.context h1{
    text-align: center;
    color: #fff;
    font-size: 50px;
}


.area{
    background: #4e54c8;  
    background: -webkit-linear-gradient(to left, #8f94fb, #4e54c8);  
    width: 100%;
    height:100vh;
    
   
}

.circles{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.circles li{
    position: absolute;
    display: block;
    list-style: none;
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.2);
    animation: animate 25s linear infinite;
    bottom: -150px;
    
}

.circles li:nth-child(1){
    left: 25%;
    width: 80px;
    height: 80px;
    animation-delay: 0s;
}


.circles li:nth-child(2){
    left: 10%;
    width: 20px;
    height: 20px;
    animation-delay: 2s;
    animation-duration: 12s;
}

.circles li:nth-child(3){
    left: 70%;
    width: 20px;
    height: 20px;
    animation-delay: 4s;
}

.circles li:nth-child(4){
    left: 40%;
    width: 60px;
    height: 60px;
    animation-delay: 0s;
    animation-duration: 18s;
}

.circles li:nth-child(5){
    left: 65%;
    width: 20px;
    height: 20px;
    animation-delay: 0s;
}

.circles li:nth-child(6){
    left: 75%;
    width: 110px;
    height: 110px;
    animation-delay: 3s;
}

.circles li:nth-child(7){
    left: 35%;
    width: 150px;
    height: 150px;
    animation-delay: 7s;
}

.circles li:nth-child(8){
    left: 50%;
    width: 25px;
    height: 25px;
    animation-delay: 15s;
    animation-duration: 45s;
}

.circles li:nth-child(9){
    left: 20%;
    width: 15px;
    height: 15px;
    animation-delay: 2s;
    animation-duration: 35s;
}

.circles li:nth-child(10){
    left: 85%;
    width: 150px;
    height: 150px;
    animation-delay: 0s;
    animation-duration: 11s;
}



@keyframes animate {

    0%{
        transform: translateY(0) rotate(0deg);
        opacity: 1;
        border-radius: 0;
    }

    100%{
        transform: translateY(-1000px) rotate(720deg);
        opacity: 0;
        border-radius: 50%;
    }

}body {
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

.c-row-label {
  height: 27px;
  width: 30px;
  text-align: center;
  justify-content: center;
  font-size: 12px;
  line-height: 27px;
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

.ticket-system {
  max-width: 385px;
}
.ticket-system .top {
  display: flex;
  align-items: center;
  flex-direction: column;
}
.ticket-system .top .title {
  font-weight: normal;
  font-size: 1.6em;
  text-align: left;
  margin-left: 20px;
  margin-bottom: 50px;
  color: #fff;
}
.ticket-system .top .printer {
  width: 90%;
  height: 20px;
  border: 5px solid #fff;
  border-radius: 10px;
  box-shadow: 1px 3px 3px 0px rgba(0, 0, 0, 0.2);
}
.ticket-system .receipts-wrapper {
  overflow: hidden;
  margin-top: -10px;
  padding-bottom: 10px;
}
.ticket-system .receipts {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  transform: translateY(-510px);
  animation-duration: 2.5s;
  animation-delay: 500ms;
  animation-name: print;
  animation-fill-mode: forwards;
}
.ticket-system .receipts .receipt {
  padding: 25px 30px;
  text-align: left;
  min-height: 200px;
  width: 88%;
  background-color: #fff;
  border-radius: 10px 10px 20px 20px;
  box-shadow: 1px 3px 8px 3px rgba(0, 0, 0, 0.2);
}
.ticket-system .receipts .receipt .airliner-logo {
  max-width: 80px;
}
.ticket-system .receipts .receipt .route {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0;
}
.ticket-system .receipts .receipt .route .plane-icon {
  width: 30px;
  height: 30px;
  transform: rotate(90deg);
}
.ticket-system .receipts .receipt .route h2 {
  font-weight: 300;
  font-size: 2.2em;
  margin: 0;
}
.ticket-system .receipts .receipt .details {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
.ticket-system .receipts .receipt .details .item {
  display: flex;
  flex-direction: column;
  min-width: 70px;
}
.ticket-system .receipts .receipt .details .item span {
  font-size: 0.8em;
  color: rgba(28, 28, 28, 0.7);
  font-weight: 500;
}
.ticket-system .receipts .receipt .details .item h3 {
  margin-top: 10px;
  margin-bottom: 25px;
}
.ticket-system .receipts .receipt.qr-code {
  height: 110px;
  min-height: unset;
  position: relative;
  border-radius: 20px 20px 10px 10px;
  display: flex;
  align-items: center;
}
.ticket-system .receipts .receipt.qr-code::before {
  content: "";
  background: linear-gradient(to right, #fff 50%, #444451 50%);
  background-size: 22px 4px, 100% 4px;
  height: 4px;
  width: 90%;
  display: block;
  left: 0;
  right: 0;
  top: -1px;
  position: absolute;
  margin: auto;
}
.ticket-system .receipts .receipt.qr-code .qr {
  width: 70px;
  height: 70px;
}
.ticket-system .receipts .receipt.qr-code .description {
  margin-left: 20px;
}
.ticket-system .receipts .receipt.qr-code .description h2 {
  margin: 0 0 5px 0;
  font-weight: 500;
}
.ticket-system .receipts .receipt.qr-code .description p {
  margin: 0;
  font-weight: 400;
}

@keyframes print {
  0% {
    transform: translateY(-510px);
  }
  35% {
    transform: translateY(-395px);
  }
  70% {
    transform: translateY(-140px);
  }
  100% {
    transform: translateY(0);
  }
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
