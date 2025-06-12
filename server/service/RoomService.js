// server/service/RoomService.js
import {
  createRoom as createRoomInstance,
  getRoomByCode,
  deleteRoom,
  getAllRooms,
  getRoomByPlayer,
} from '../game/RoomManager.js';

const RoomService = {
  createRoom(socket, io) {
    const { room, roomCode } = createRoomInstance(socket, io);
    const color = room.getPlayerColor(socket.id);
    socket.emit('roomCreated', { roomCode, color });
    console.log(`🆕 Room created: ${roomCode}`);
  },

  joinRoom(socket, io, roomCode) {
    const room = getRoomByCode(roomCode);
    if (!room || room.players.length >= 2) {
      socket.emit('errorMessage', 'Өрөө олдсонгүй эсвэл дүүрэн байна!');
      return;
    }

    const added = room.addPlayer(socket.id);
    if (!added) {
      socket.emit('errorMessage', 'Өрөө дүүрсэн байна!');
      return;
    }

    socket.join(roomCode);
    socket.roomCode = roomCode;
    console.log(`👥 Player joined room: ${roomCode}`);

    if (room.players.length === 2) {
      const result = {
        pieces: room.gameLogic.pieces,
        currentTurn: room.gameLogic.currentTurn,
        movablePieces: room.gameLogic.movablePieces,
      };

      room.players.forEach((playerId) => {
        const color = room.getPlayerColor(playerId);
        io.to(playerId).emit('roomJoined', {
          roomCode,
          color,
          ...result,
        });
      });
    }
  },

  leaveRoom(socket, io, roomCode) {
    const room = getRoomByCode(roomCode);
    if (!room) return;

    room.removePlayer(socket.id);
    socket.leave(roomCode);

    if (room.players.length === 0) {
      deleteRoom(roomCode);
      console.log(`❌ Room deleted: ${roomCode}`);
    } else {
      io.to(roomCode).emit('opponentLeft');
    }
  },

  handleDisconnect(socket, io) {
    const room = getRoomByPlayer(socket.id, socket.roomCode);
    if (!room) return;

    // 🔸 Disconnect болсон тоглогчийг тэмдэглэ
    room.removePlayer(socket.id);

    // 🔸 Сэргээхэд зориулж тоглоомын төлөв хадгалах (хэрвээ шаардлагатай бол)
    const saveData = room.getSaveData();
    // Та хүсвэл энэ saveData-г файл эсвэл DB-д хадгалах боломжтой

    // 🔸 Нөгөө тоглогчид мэдэгдэл илгээх
    for (const playerId of room.players) {
      io.to(playerId).emit('playerDisconnected', {
        playerId: socket.id,
        message: 'Тоглогч тоглоомоос гарсан байна.',
      });
    }

    // 🔸 Хэрвээ өрөөнд огт хүн үлдээгүй бол устгах
    if (room.players.length === 0) {
      deleteRoom(room.roomCode);
      console.log(`[Room ${room.roomCode}] Хоосорсон тул устлаа.`);
    }
  },
};

export default RoomService;
