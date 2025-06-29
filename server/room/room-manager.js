import GameRoom from './game-room.js';

export default class RoomsManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
  }

  createRoom(socket, vsBot = false) {
    if (!socket.player || !socket.player.userId) {
      console.warn('⚠️ socket.player байхгүй байна. Өрөө үүсгэх боломжгүй.');
      return null;
    }
    const roomCode = this.generateCode();
    const room = new GameRoom(roomCode, this.io, vsBot);
    room.pm.addPlayer(socket, {
      userId: socket.player.userId,
      username: socket.player.username,
      avatarUrl: socket.player.avatarUrl,
    });
    if (vsBot) {
      room.pm.addBot();
    }
    this.rooms.set(roomCode, room);
    return room;
  }

  getRoom(code) {
    return this.rooms.get(code);
  }

  findRoomByUserId(userId) {
    for (const room of this.rooms.values()) {
      if (room.pm.players.some((p) => p.userId === userId)) return room;
    }
    return null;
  }

  findRoomBySocketId(socketId) {
    for (const room of this.rooms.values()) {
      if (room.pm.hasPlayer(socketId)) return room;
    }
    return null;
  }

  reconnectPlayer(userId, socket) {
    const room = this.findRoomByUserId(userId);
    if (!room) return null;

    if (typeof room.reconnectPlayer === 'function') {
      room.reconnectPlayer(socket);
    } else {
      // Эсвэл доорх шиг socketId update хийх
      room.pm.updateSocketId(userId, socket.id);
      socket.join(room.roomCode);
      socket.roomCode = room.roomCode;
    }
    return room;
  }

  removePlayer(socketId) {
    for (const [code, room] of this.rooms.entries()) {
      if (room.pm.hasPlayer(socketId)) {
        console.log('Тоглогч байгаа');
        room.pm.removePlayer(socketId);
        if (room.pm.players.length === 0) {
          this.rooms.delete(code);
        }
        break;
      }
    }
  }

  deleteRoom(code) {
    this.rooms.delete(code);
  }

  getAllRooms() {
    return Array.from(this.rooms.values());
  }

  generateCode() {
    let code;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.rooms.has(code));
    return code;
  }
}
