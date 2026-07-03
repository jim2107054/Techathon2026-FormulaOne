import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected to backend socket server");
});

socket.on("device:update", (payload) => {
  console.log("device:update", payload);
});

socket.on("alert:new", (payload) => {
  console.log("alert:new", payload);
});
