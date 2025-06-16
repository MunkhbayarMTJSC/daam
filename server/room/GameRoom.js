import GameLogic from '../logic/GameLogic.js';
import BoardManager from '../model/BoardManager.js';
export default class GameRoom {
  constructor(roomCode, io) {
    this.roomCode = roomCode;
    this.io = io;
    this.board = new BoardManager();
    this.players = [];
    this.currentTurn = 1;
    this.playerColors = {};
    this.moveHistory = [];
    this.disconnectedAt = {};
    this.gameStartedAt = Date.now();
    this.gameEndedAt = null;
    this.winner = null;
    this.gameLogic = new GameLogic(this.board, (winner) => {
      this.gameEndedAt = Date.now();

      const duration = this.gameEndedAt - this.gameStartedAt;
      const formatetDuration = this.formatDuration(duration);
      for (const id of this.players) {
        io.to(id).emit('gameEnded', {
          winner,
          formatetDuration,
          moveCount: this.moveHistory.length,
          playerColors: this.playerColors,
        });
      }
    });
  }
  addPlayer(socket, { userId, username, avatarUrl }) {
    const socketId = socket.id;
    this.playerColors[socketId] = this.players.length === 0 ? 0 : 1;
    this.players.push({
      socketId: socket.id,
      userId,
      username,
      avatarUrl,
      isHost: this.players.length === 0,
      ready: false,
    });
    socket.join(this.roomCode);
  }
  hasPlayer(socketId) {
    return this.players.some((p) => p.socketId === socketId);
  }

  isFull() {
    return this.players.length >= 2;
  }
  setReady(socketId) {
    const player = this.players.find((p) => p.socketId === socketId);
    if (player) {
      player.ready = true;
    }
  }
  getPlayerList() {
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
  isPlayerTurn(socketId) {
    const currentPlayer = this.players[this.currentTurn];
    return currentPlayer.socketId === socketId;
  }

  handleMove(socketId, pieceData, moveChain) {
    if (!this.isPlayerTurn(socketId)) return { error: 'Таны ээлж биш!' };

    const piece = this.gameLogic.pieceManager.pieces.find(
      (p) => p.id === pieceData.id
    );
    if (!piece) return { error: 'Чулуу олдсонгүй!' };

    const validChains = this.gameLogic.moveCalculator.getValidMoves(piece);
    const matchedChain = validChains.find((chain) =>
      this.chainsMatch(chain, moveChain)
    );
    if (!matchedChain) return { error: 'Буруу нүүдлийн дараалал!' };
    const isCapture = matchedChain.some((step) => step.captured);

    let chaining = false;
    if (isCapture) {
      chaining = this.gameLogic.moveCapture(
        piece,
        matchedChain,
        this.currentTurn
      );
    } else {
      this.gameLogic.moveSimple(piece, matchedChain[0], this.currentTurn);
    }

    this.moveHistory.push({
      pieceId: piece.id,
      path: matchedChain.map(({ row, col }) => ({ row, col })),
      isCapture,
      turn: this.currentTurn,
    });

    if (!chaining) this.currentTurn = 1 - this.currentTurn;

    const movablePieces = this.gameLogic.updateMovablePieces(this.currentTurn);
    const capturedCounts = this.calculateCapturedCounts();
    console.log('Captured ', capturedCounts);
    return {
      pieces: this.gameLogic.pieceManager.pieces,
      currentTurn: this.currentTurn,
      chaining: this.gameLogic.currentValidMoves !== null,
      movablePieces,
      capturedCounts,
      isCapture,
      pieceMoved: true,
    };
  }

  calculateCapturedCounts() {
    const player1Pieces = this.gameLogic.pieceManager.getAllByColor(0);
    const player2Pieces = this.gameLogic.pieceManager.getAllByColor(1);

    return {
      0: 20 - player1Pieces.length,
      1: 20 - player2Pieces.length,
    };
  }

  chainsMatch(chainA, chainB) {
    if (chainA.length !== chainB.length) return false;
    for (let i = 0; i < chainA.length; i++) {
      if (chainA[i].row !== chainB[i].row || chainA[i].col !== chainB[i].col) {
        return false;
      }
    }
    return true;
  }
  getPlayerColor(socket) {
    const result = this.playerColors[socket.id] ?? null;
    return result;
  }
  getSaveData() {
    return {
      roomCode: this.roomCode,
      players: this.players,
      playerColors: this.playerColors,
      currentTurn: this.currentTurn,
      pieces: this.gameLogic.pieceManager.pieces, // эсвэл serialize() хэлбэрээр
      moveHistory: this.moveHistory,
      winner: this.winner,
      gameStartedAt: this.gameStartedAt,
      gameEndedAt: this.gameEndedAt,
    };
  }
  loadFromData(data) {
    this.roomCode = data.roomCode;
    this.players = data.players;
    this.playerColors = data.playerColors;
    this.currentTurn = data.currentTurn;
    this.board = new Board();
    this.board.deserialize(data.board); // BoardManager дотор deserialize() функц

    this.gameLogic = new GameLogic(this.board, (winner) => {
      this.io.to(this.roomCode).emit('gameEnded', { winner });
    });
    this.gameLogic.pieceManager.pieces = data.pieces; // эсвэл deserialize

    this.moveHistory = data.moveHistory;
    this.winner = data.winner;
    this.gameStartedAt = data.gameStartedAt;
    this.gameEndedAt = data.gameEndedAt;
  }
  broadcast(event, payload) {
    this.io.to(this.roomCode).emit(event, payload);
  }
  formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} мин ${seconds} сек`;
  }
}
