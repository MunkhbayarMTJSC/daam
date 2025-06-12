// server/state/RoomManager.js
import GameRooms from '../game/GameRooms.js';

const rooms = {};

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
  //return 898989;
}

function createRoom(socket, io) {
  const roomCode = generateRoomCode();
  const room = new GameRooms(roomCode, io);
  room.addPlayer(socket.id);
  rooms[roomCode] = room;

  socket.join(roomCode);
  socket.roomCode = roomCode;

  return { room, roomCode };
}

function getRoomByCode(code) {
  return rooms[code];
}

function deleteRoom(code) {
  delete rooms[code];
}

function getAllRooms() {
  return rooms;
}

function getRoomBySocketId(socketId) {
  return Object.entries(rooms).find(([_, room]) =>
    room.players.includes(socketId)
  );
}
function getRoomByPlayer(socketId, roomCode) {
  const room = rooms[roomCode];
  if (!room) return null; // ✅ өрөө байгаа эсэхийг шалгана

  if (room.players.includes(socketId)) {
    return room;
  }
  return null;
}

export {
  createRoom,
  getRoomByCode,
  deleteRoom,
  getAllRooms,
  getRoomBySocketId,
  getRoomByPlayer,
};
