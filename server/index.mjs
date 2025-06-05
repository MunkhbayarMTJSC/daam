import dotenv from "dotenv";
dotenv.config({ path: ".env.production" });

import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import handlePlayerSocket from "./sockets/playerSocket.js";
import handleGameSocket from "./sockets/gameSocket.js";
import handleRoomSocket from "./sockets/roomSocket.js";
// __dirname тохируулах
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⬇️ Express app үүсгэх
const app = express();
app.use(express.static(path.join(__dirname, "public")));

// ⬇️ HTTP server + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// ⬇️ Rooms хадгалах
const rooms = {}; // { roomCode: GameRoom instance }

// ⬇️ Socket.IO логик (танай одоогийн логик энэ хэсэгт)
// ⬇️ Server эхлүүлэх
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on ${PORT}`);
});

// ✔️ ОРЧИНГ ялгах
const isProd = process.env.NODE_ENV === "production";
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB холбогдлоо"))
  .catch((err) => console.error("❌ MongoDB холбогдож чадсангүй:", err));

console.log(process.env.MONGO_URI);

io.on("connection", (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);

  // 🆕 Тоглогчийн соккит
  handlePlayerSocket(socket, io);
  // 🆕 Өрөөний соккит
  handleRoomSocket(socket, io, rooms);

  handleGameSocket(socket, io, rooms);
});
