import GameRooms from "../controller/GameRooms.js";

import { customAlphabet } from "nanoid";

export default function handleRoomSocket(socket, io, rooms) {
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
    socket.roomCode = roomCode;

    const color = room.getPlayerColor(socket.id); // ⬅️ Өнгө оноох

    console.log(`🆕 Room created: ${roomCode}`);
    socket.emit("roomCreated", { roomCode, color }); // ⬅️ өнгийг буцаах
  });

  // 🆕 JoinRoom үед
  socket.on("joinRoom", (roomCode) => {
    const room = rooms[roomCode];
    socket.roomCode = roomCode;

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

  // бусад game-тэй холбоотой socket event
}
