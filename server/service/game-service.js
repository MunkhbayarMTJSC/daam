export default class GameService {
  constructor(rooms, io, socket) {
    this.rooms = rooms;
    this.io = io;
    this.socket = socket;
  }
  setPlayerReady(socketId, room) {
    room.pm.toggleReady(socketId);
    const players = room.pm.getPlayers();
    this.io.to(room.roomCode).emit('updateReadyStatus', { players });
    if (room.pm.areBothReady()) {
      this.io.to(room.roomCode).emit('bothReadyImg', players);
      this.io.to(room.roomCode).emit('bothReady', players);
      console.log(`🎮 Тоглоом эхэлж байна: ${room.roomCode}`);
      this.startGame(room.roomCode);
    }
  }
  startGame(roomCode) {
    const room = this.rooms.getRoom(roomCode);
    if (!room) return { error: 'Room not found' };

    room.startGame();

    const data = {
      pieces: room.gl.pieceManager.pieces,
      currentTurn: room.gs.currentTurn,
      movablePieces: room.gl.currentMovablePieces,
      pieceMoved: false,
    };

    this.io.to(roomCode).emit('bothReadyImg', room.pm.getPlayers());
    this.io.to(roomCode).emit('setTurn', data.currentTurn);
    this.io.to(roomCode).emit('updateBoard', data);

    return data;
  }
  selectPiece(pieceId, roomCode) {
    const room = this.rooms.getRoom(roomCode);
    const socketId = this.socket.id;
    const color = room.pm.getColor(socketId);
    const piece = room.gl.pieceManager.pieces.find((p) => p.id === pieceId);
    if (!piece) {
      return this.socket.emit('roomError', { message: 'Хүү олдсонгүй' });
    }
    if (piece.color !== color) {
      return this.socket.emit('roomError', { message: 'Энэ хүү таных биш' });
    }
    const moveChains = room.gl.moveCalculator.getValidMoves(piece);
    this.io.to(roomCode).emit('clearHighlightMovePath');
    this.socket.emit('highlightMoves', { piece, moves: moveChains });
  }

  handleMove(roomCode, piece, moveChain) {
    const socketId = this.socket.id;
    const room = this.rooms.getRoom(roomCode);
    if (!room) return { error: 'Room not found' };

    const result = room.mh.handleMove(socketId, piece, moveChain);
    if (result?.error) {
      this.socket.emit('roomError', result.error);
      return;
    }
    this.io.to(roomCode).emit('highlightMovePath', { piece, moveChain });
    this.io.to(roomCode).emit('updateBoard', result);
    if (!result.chaining && room.bm.isBotTurn()) {
      setTimeout(() => room.bm.makeMove(), 500);
    }
  }

  requistedReplay(roomCode, vsBot) {
    const room = this.rooms.getRoom(roomCode);
    if (!room) return { error: 'Room not found' };
    room.resetForReplay();
    const players = room.pm.getPlayers();
    this.socket.emit('showGameReady', { players, replay: true });
    this.io.to(room.roomCode).emit('updateReadyStatus', { players });
  }
  reconnectPlayer(userId, socket) {
    const room = this.rooms.findRoomByUserId(userId);
    if (!room) return null;

    room.pm.updateSocketId(userId, socket.id);
    socket.join(room.roomCode);

    return {
      roomCode: room.roomCode,
      playerColor: room.getPlayerColor(socket),
      players: room.getPlayerList(),
      initialData: {
        pieces: room.gameLogic.pieceManager.pieces,
        currentTurn: room.currentTurn,
        movablePieces: room.gameLogic.currentMovablePieces,
      },
    };
  }

  removePlayer(socketId) {
    const room = this.rooms.findRoomBySocketId(socketId);
    if (!room) {
      console.warn('⚠️ Өрөө үүсгээгүй байна.');
      return;
    }
    const player = room.pm.getPlayer(socketId);
    if (room) {
      room.pm.removePlayerCompletely(player.userId);
      if (room.pm.players.length === 0) {
        this.rooms.deleteRoom(room.roomCode);
        console.log(`🗑️ Өрөө ${room.roomCode} хоосорсон тул устгагдлаа`);
      }
    }
  }
  startGameWithBot(socket, userInfo) {
    let room = this.rooms.getRoomBySocket(socket.id);
    if (!room) {
      room = this.rooms.createRoom(this.io, socket, userInfo, true);
      room.addBot();
    }

    const playerColor = room.getPlayerColor(socket);

    const gameState = {
      roomCode: room.roomCode,
      playerColor,
      vsBot: true,
      players: room.getPlayerList(),
      initialData: {
        pieces: room.gameLogic.pieceManager.pieces,
        currentTurn: room.currentTurn,
        movablePieces: room.gameLogic.currentMovablePieces,
      },
    };

    socket.emit('gameStartedWithBot', gameState);

    if (room.currentTurn === room.botColor) {
      setTimeout(() => room.makeBotMove(), 500);
    }
  }
}
