import GameRoom from './GameRoom.js';
export default class RoomManager {
  constructor() {
    this.rooms = new Map(); // { code: GameRoom }
  }

  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  createRoom(io, socket, { userId, username, avatarUrl }) {
    const roomCode = this.generateCode();
    const room = new GameRoom(roomCode, io);
    room.addPlayer(socket, { userId, username, avatarUrl });
    this.rooms.set(roomCode, room);
    return room;
  }

  joinRoom(socket, roomCode, { userId, username, avatarUrl }) {
    const room = this.rooms.get(roomCode);
    if (!room || room.isFull()) return null;
    room.addPlayer(socket, { userId, username, avatarUrl });
    return room;
  }

  getRoom(code) {
    return this.rooms.get(code);
  }
}
