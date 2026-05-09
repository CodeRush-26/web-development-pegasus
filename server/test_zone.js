import { io } from "socket.io-client";
import WebSocket from "ws";

// Simulate the admin sending the zone_create message
const ws = new WebSocket("ws://localhost:4000/ws?token=admin-mock-token-if-needed");

ws.on("open", () => {
  console.log("Connected");
  
  // Try sending zone_create
  const payload = {
    name: "Test Zone",
    polygon: [
      [26.5, 56.0],
      [26.6, 56.0],
      [26.6, 56.1],
      [26.5, 56.1]
    ],
    restrictedShipIds: []
  };

  ws.send(JSON.stringify({
    type: "zone_create",
    payload
  }));

  console.log("Sent zone_create");
});

ws.on("message", (data) => {
  console.log("Received:", data.toString());
});

ws.on("close", () => {
  console.log("Disconnected");
});

ws.on("error", (err) => {
  console.error("WS error:", err);
});
