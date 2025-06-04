import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import GameRooms from "./rooms/GameRooms.js";
import { customAlphabet } from "nanoid";

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
io.on("connection", (socket) => {
  // ... бүх listener-ууд энд ...
});

// ⬇️ Server эхлүүлэх
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);

  // 🆕 Өрөө үүсгэх үед
  socket.on("createRoom", () => {
    let roomCode;
    const nanoid = customAlphabet("1234567890", 6);
    do {
      roomCode = nanoid();
    } while (rooms[roomCode]);

    const room = new GameRooms(roomCode);
    room.addPlayer(socket.id);
    rooms[roomCode] = room;
    socket.join(roomCode);

    const color = room.getPlayerColor(socket.id); // ⬅️ Өнгө оноох

    console.log(`🆕 Room created: ${roomCode}`);
    socket.emit("roomCreated", { roomCode, color }); // ⬅️ өнгийг буцаах
  });

  // 🆕 JoinRoom үед
  socket.on("joinRoom", (roomCode) => {
    const room = rooms[roomCode];

    if (!room || room.players.length >= 2) {
      socket.emit("errorMessage", "Өрөө олдсонгүй эсвэл дүүрэн байна!");
      return;
    }

    const added = room.addPlayer(socket.id);
    if (!added) {
      socket.emit("errorMessage", "Өрөө дүүрсэн байна!");
      return;
    }

    socket.join(roomCode);

    console.log(`👥 Player joined room: ${roomCode}`);

    if (room.players.length === 2) {
      const result = {
        pieces: room.gameLogic.pieces,
        currentTurn: room.gameLogic.currentTurn,
        movablePieces: room.gameLogic.movablePieces,
      };
      room.players.forEach((playerId) => {
        const color = room.getPlayerColor(playerId); // ⬅️ өнгө
        io.to(playerId).emit("roomJoined", {
          roomCode,
          color,
          pieces: result.pieces,
          currentTurn: result.currentTurn,
          movablePieces: result.movablePieces,
        });
      });
    }
  });

  // Тоглогч өрөөнд ороод сэрвэртэй холбогдож байгаа бол updateEvent дуудна
  socket.on("requestBoardState", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;
    const result = {
      pieces: room.gameLogic.pieces,
      currentTurn: room.currentTurn,
      movablePieces: room.gameLogic.currentMovablePieces,
    };
    socket.emit("updateBoard", result);
  });
  // Хүү сонгоход серверт хандаж highlight хийх
  socket.on("selectedPiece", ({ roomCode, pieceId }) => {
    const room = rooms[roomCode];
    if (!room) return;

    const color = room.getPlayerColor(socket.id);
    const piece = room.gameLogic.pieces.find((p) => p.id === pieceId);

    if (!piece) {
      socket.emit("errorMessage", "Хүү олдсонгүй!");
      return;
    }
    if (piece.color !== color) {
      socket.emit("errorMessage", "Энэ хүү таных биш!");
      return;
    }

    const moves = room.gameLogic.getValidMoves(piece); // ➡️ valid moves авах
    socket.emit("highlightMoves", { piece, moves }); // ➡️ зөвхөн тухайн тоглогч руу буцаах
  });
  // Тоглогчийн нүүдэл ирэхэд ахих
  socket.on("playerMove", ({ roomCode, piece, move }) => {
    const room = rooms[roomCode];

    if (!room) {
      socket.emit("errorMessage", "Өрөө олдсонгүй!");
      return;
    }

    const result = room.handleMove(socket.id, piece, move);
    const socketIds = room.players;
    for (const id of socketIds) {
      if (result?.error) {
        socket.emit("errorMessage", result.error);
      } else if (result) {
        // Өрөөнд байгаа БҮХ тоглогчдод шинэчлэл илгээх
        io.to(id).emit("updateBoard", {
          pieces: result.pieces,
          currentTurn: result.currentTurn,
          movablePieces: room.gameLogic.currentMovablePieces, // ✨ нэмэлт
        });
      }
    }
  });

  // Тоглогч өрөөнөөс гарах
  socket.on("leaveRoom", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;

    room.removePlayer(socket.id);
    socket.leave(roomCode);

    if (room.players.length === 0) {
      delete rooms[roomCode];
      console.log(`❌ Room deleted: ${roomCode}`);
    } else {
      io.to(roomCode).emit("opponentLeft");
    }
  });

  // Салсан тохиолдол: тоглогч disconnect хийх
  socket.on("disconnect", () => {
    for (const [roomCode, room] of Object.entries(rooms)) {
      const idx = room.players.indexOf(socket.id);
      if (idx !== -1) {
        // Тоглогчийг массивнаас хасах
        room.players.splice(idx, 1);

        if (room.players.length === 0) {
          delete rooms[roomCode];
          console.log(`❌ Room deleted: ${roomCode}`);
        } else {
          io.to(roomCode).emit("opponentLeft");
        }
        break;
      }
    }
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });

  // Ялагч тодроход
  socket.on("gameOver", ({ roomCode, winner }) => {
    console.log("Ялагчийг хүлээж авав", winner);
    io.to(roomCode).emit("gameEnded", { winner });
  });
});
