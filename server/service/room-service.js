export default class RoomService {
  constructor(roomsManager, io) {
    this.roomsManager = roomsManager;
    this.io = io;
  }

  createRoom(socket, vsBot = false) {
    const room = this.roomsManager.createRoom(socket, vsBot);
    if (!room) {
      console.warn('⚠️ Өрөө үүсгээгүй байна.');
      return;
    }
    setTimeout(() => {
      const players = room.pm.getPlayers();
      socket.emit('showGameReady', { players, replay: false });
    }, 100);
    return room;
  }

  joinRoom(socket, code) {
    const room = this.roomsManager.getRoom(code);
    if (!room) return { error: 'Room not found' };
    if (!socket.player || !socket.player.userId) {
      console.warn('⚠️ socket.player байхгүй байна. Өрөөнд нэгдэх боломжгүй.');
      return null;
    }
    room.pm.addPlayer(socket, {
      userId: socket.player.userId,
      username: socket.player.username,
      avatarUrl: socket.player.avatarUrl,
    });

    socket.join(code);
    socket.roomCode = code;
    this.io.to(code).emit('playerJoined', room.pm.players);
    setTimeout(() => {
      const players = room.pm.getPlayers();
      this.io.to(room.roomCode).emit('updateReadyStatus', { players });
      socket.emit('showGameReady', { players, replay: false });
    }, 100);
    return { room };
  }

  reconnectPlayer(userId, socket) {
    return this.roomsManager.reconnectPlayer(userId, socket);
  }

  removePlayer(userId) {
    const room = this.roomsManager.findRoomByUserId(userId);
    if (room) {
      room.pm.removePlayerCompletely(userId);
      const players = room.pm.getPlayers();
      this.io.to(room.roomCode).emit('updateReadyStatus', { players });
      if (room.pm.players.length === 0 || room.vsBot) {
        this.roomsManager.deleteRoom(room.roomCode);
        console.log(`🗑️ Өрөө ${room.roomCode} хоосорсон тул устгагдлаа`);
      }
    }
  }
}
