import dotenv from "dotenv";
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env";

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import PlayerController from "./controller/PlayerController.js";
import GameController from "./controller/GameController.js";
import MissionController from "./controller/MissionController.js";
import RoomController from "./controller/RoomController.js";

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
    origin: "*", // эсвэл "*" түр зуур
    methods: ["GET", "POST"],
    credentials: true,
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
// ✔️ ОРЧИНГ ялгахconst PORT = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;


mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB холбогдлоо"))
  .catch((err) => console.error("❌ MongoDB холбогдож чадсангүй:", err));

io.on("connection", (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);

  // 🆕 Тоглогчийн соккит
  PlayerController(socket, io);
  MissionController(socket, io);
  // 🆕 Өрөөний соккит
  GameController(socket, io, rooms);

  RoomController(socket, io, rooms);
});
