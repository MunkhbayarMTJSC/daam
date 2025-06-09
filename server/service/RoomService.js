import GameRooms from "../game/GameRooms.js"; // GameRoom загвар чинь энд ашиглагдана

const RoomService = {
  createRoom(socket, io, rooms) {
    let roomCode = 898989; // түр хэрэглээ
    const room = new GameRooms(roomCode);
    room.addPlayer(socket.id);
    rooms[roomCode] = room;

    socket.join(roomCode);
    socket.roomCode = roomCode;
    const color = room.getPlayerColor(socket.id);

    console.log(`🆕 Room created: ${roomCode}`);
    socket.emit("roomCreated", { roomCode, color });
  },

  joinRoom(socket, io, rooms, roomCode) {
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
        const color = room.getPlayerColor(playerId);
        io.to(playerId).emit("roomJoined", {
          roomCode,
          color,
          ...result,
        });
      });
    }
  },

  leaveRoom(socket, io, rooms, roomCode) {
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
  },

  handleDisconnect(socket, io, rooms) {
    for (const [roomCode, room] of Object.entries(rooms)) {
      const idx = room.players.indexOf(socket.id);
      if (idx !== -1) {
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
  },
};

export default RoomService;
