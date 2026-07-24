import { io } from "socket.io-client";

export const socket = io("import.meta.env.VITE_SOCKET_URL", {
  autoConnect: false,
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("❌ Socket Error:", err.message);
});