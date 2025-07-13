export default class PlayerManager {
  constructor(roomCode, io) {
    this.players = [];
    this.playerColors = {};
    this.disconnectedAt = {};
    this.roomCode = roomCode;
    this.io = io;
  }
  addPlayer(socket, { userId, username, avatarUrl }) {
    const socketId = socket.id;
    const existingPlayer = this.players.find((p) => p.userId === userId);
    if (existingPlayer) {
      existingPlayer.socketId = socketId;
      socket.join(this.roomCode);
      socket.roomCode = this.roomCode;
      return;
    }
    const color = this.players.length === 0 ? 0 : 1;
    this.playerColors[socketId] = color;
    this.players.push({
      socketId,
      userId,
      username,
      avatarUrl,
      isHost: this.players.length === 0,
      ready: false,
      color,
    });
    socket.join(this.roomCode);
    socket.roomCode = this.roomCode;
    console.log(`✅ Player joined room : ${username}`);
  }

  addBot() {
    const socketId = 'bot';
    this.playerColors[socketId] = 1;
    this.players.push({
      socketId,
      username: 'Computer',
      avatarUrl: '/assets/bot.png',
      isHost: false,
      ready: true,
    });
  }

  removePlayer(socketId) {
    const player = this.players.find((p) => p.socketId === socketId);
    if (!player) return;
    this.disconnectedAt[socketId] = Date.now();
    delete this.playerColors[socketId];
    player.socketId = null;
  }

  hasPlayer(socketId) {
    return this.players.some((p) => p.socketId === socketId);
  }
  toggleReady(socketId) {
    const player = this.players.find((p) => p.socketId === socketId);
    if (player) {
      player.ready = !player.ready;
    }
  }
  resetReady() {
    this.players.forEach((p) => (p.ready = false));
  }
  assignNewHost() {
    if (this.players.length > 0) {
      this.players.forEach((p) => (p.isHost = false)); // бүгдээс хасна
      this.players[0].isHost = true; // эхний тоглогчийг host болгоно
    }
  }
  getPlayer(socketId) {
    return this.players.find((p) => p.socketId === socketId);
  }

  getPlayerByColor(color) {
    const socketId = Object.keys(this.playerColors).find(
      (id) => this.playerColors[id] === color
    );
    if (!socketId) return null;
    return this.players.find((p) => p.socketId === socketId);
  }

  getSocketByPlayer(player) {
    if (!player || !player.userId) return null;
    for (const socket of this.io.sockets.sockets.values()) {
      if (socket.player?.userId === player.userId) return socket;
    }
    return null;
  }

  getPlayers() {
    return this.players.map((player) => ({
      username: player.username,
      isHost: player.isHost,
      avatarUrl: player.avatarUrl,
      ready: player.ready,
      socketId: player.socketId,
    }));
  }
  areBothReady() {
    return this.players.length === 2 && this.players.every((p) => p.ready);
  }
  getColor(socketId) {
    return this.playerColors[socketId] ?? null;
  }
  getColorByUserId(userId) {
    const player = this.players.find((p) => p.userId === userId);
    return player ? this.playerColors[player.socketId] : null;
  }

  updateSocketId(userId, newSocketId) {
    const player = this.players.find((p) => p.userId === userId);
    if (player) {
      if (player.socketId) {
        delete this.playerColors[player.socketId];
      }
      player.socketId = newSocketId;
      if (!(newSocketId in this.playerColors)) {
        this.playerColors[newSocketId] =
          this.players.indexOf(player) === 0 ? 0 : 1;
      }
    }
  }
  removePlayerCompletely(userId) {
    const index = this.players.findIndex((p) => p.userId === userId);
    if (index !== -1) {
      const socketId = this.players[index].socketId;
      if (socketId) {
        delete this.playerColors[socketId];
      }
      this.players.splice(index, 1);
    }
  }

  cleanDisconnectedPlayers(timeoutMs = 300000) {
    // 5 минут
    const now = Date.now();
    this.players = this.players.filter((player) => {
      if (player.socketId === null) {
        const discTime = this.disconnectedAt[player.socketId];
        if (!discTime || now - discTime > timeoutMs) {
          delete this.playerColors[player.socketId];
          return false; // Устгах
        }
      }
      return true; // Хадгалах
    });
  }
}
