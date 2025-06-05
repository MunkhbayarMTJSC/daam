import dotenv from "dotenv";
dotenv.config();
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
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

// ⬇️ Өгөгдөлийн сантай холбоно
mongoose
  .connect("mongodb://localhost:27017/checkers", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB холбогдлоо"))
  .catch((err) => console.error("❌ MongoDB холбогдож чадсангүй:", err));

io.on("connection", (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);

  // 🆕 Тоглогчийн соккит
  handlePlayerSocket(socket, io);
  // 🆕 Өрөөний соккит
  handleRoomSocket(socket, io, rooms);

  handleGameSocket(socket, io, rooms);
});
