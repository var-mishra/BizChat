import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDb from "./src/db/db.js";

import { createServer } from "http";
import { Server } from "socket.io";
import setupSocket from "./src/socket/index.js";

connectDb();

// ✅ create HTTP server
const httpServer = createServer(app);

// ✅ SOCKET.IO WITH CORS (FIXED)
// const io = new Server(httpServer, {
//   cors: {
//     origin: [process.env.CLIENT_URL,
//       "http://localhost:5173",
//       "https://biz-chat-sigma.vercel.app",
//     ],
//     credentials: true,    // ✅ React app
//     methods: ["GET", "POST"],
//   },
// });
const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
    methods: ["GET", "POST"],
  },
});
// ✅ attach socket logic
setupSocket(io);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
