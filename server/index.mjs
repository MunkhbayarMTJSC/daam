import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import { customAlphabet, nanoid } from "nanoid"; // ✅

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Хөгжүүлэлт дээр бүх origin зөвшөөрнө
  },
});

const rooms = {}; // { roomCode: [socketId1, socketId2] }

io.on("connection", (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);

  // Шинэ өрөө үүсгэх
  socket.on("createRoom", () => {
    let roomCode;
    do {
      const nanoid = customAlphabet("1234567890", 6);
      roomCode = nanoid(); // A1B2C3 гэх мэт 6 оронтой code
    } while (rooms[roomCode]);

    const room = new GameRoom(roomCode);
    room.addPlayer(socket.id);
    rooms[roomCode] = [socket.id];
    socket.join(roomCode);

    console.log(`🆕 Room created: ${roomCode}`);
    socket.emit("roomCreated", roomCode);
  });

  // Өрөөнд нэвтрэх
  socket.on("joinRoom", (roomCode) => {
    const room = rooms[roomCode];

    if (!room || !room.addPlayer(socket.id)) {
      socket.emit("errorMessage", "Өрөө олдсонгүй!");
      return;
    }

    if (room.length >= 2) {
      socket.emit("errorMessage", "Өрөө дүүрэн байна!");
      return;
    }

    room.push(socket.id);
    socket.join(roomCode);

    console.log(`👥 Player joined room: ${roomCode}`);
    // Өрөөний хоёр тоглогчид хоёуланд нь event илгээх
    io.to(roomCode).emit("roomJoined", roomCode);
  });

  // Тоглооомноос гарах товч дарсан үед
  socket.on("leaveRoom", (roomCode) => {
    if (rooms[roomCode]) {
      rooms[roomCode] = rooms[roomCode].filter((id) => !id === socket.id);
      socket.leave(roomCode);
      // Хэрвээ өрөөнд өөр хүн үлдээгүй бол устгана
      if (rooms[roomCode].length === 0) {
        delete rooms[roomCode];
        console.log(`❌ Room deleted: ${roomCode}`);
      } else {
        // Хэрвээ нэг нь үлдсэн бол нөгөөд нь мэдэгдэж болно
        io.to(roomCode).emit("opponentLeft");
      }
    }
  });

  // Тоглогчийн нүүдлийн эвэнтэд хариу өгөх
  socket.on("playerMove", (roomCode, move) => {
    const room = rooms.get(roomCode);
    const result = room.handleMove(socket.id, move);

    if (result.error) {
      socket.emit("errorMessage", result.error);
    } else {
      io.to(roomCode).emit("updateBoard", result); // << here
    }
  });

  // Салсан тохиолдолд
  socket.on("disconnect", () => {
    for (const [roomCode, players] of Object.entries(rooms)) {
      const index = players.indexOf(socket.id);
      if (index !== -1) {
        players.splice(index, 1);
        if (players.length === 0) {
          delete rooms[roomCode]; // өрөө устгах
          console.log(`❌ Room deleted: ${roomCode}`);
        }
        break;
      }
    }
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log("🚀 Server listening on http://localhost:3000");
});
