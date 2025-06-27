import GameLogic from '../logic/GameLogic.js';
import BoardManager from '../model/BoardManager.js';
export default class GameRoom {
  constructor(roomCode, io, vsBot = false) {
    this.roomCode = roomCode;
    this.io = io;
    this.board = new BoardManager();
    this.players = [];
    this.currentTurn = 1;
    this.playerColors = {};
    this.moveHistory = [];
    this.botEnabled = false;
    this.botColor = 1; // Жишээ нь хар
    this.vsBot = vsBot;
    this.disconnectedAt = {};
    this.gameStartedAt = Date.now();
    this.gameEndedAt = null;
    this.winner = null;
    this.gameLogic = new GameLogic(this.board, (winner) => {
      this.gameEndedAt = Date.now();

      const duration = this.gameEndedAt - this.gameStartedAt;
      const formatetDuration = this.formatDuration(duration);
      io.to(this.roomCode).emit('gameEnded', {
        players: this.players,
        winner,
        formatetDuration,
        moveCount: this.moveHistory.length,
        playerColors: this.playerColors,
        roomCode: this.roomCode,
        vsBot: this.vsBot,
      });
    });
  }
  enableBotMode(botColor = 1) {
    this.botEnabled = true;
    this.botColor = botColor;
  }

  isBotTurn() {
    return this.vsBot && this.currentTurn === this.botColor;
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

    this.playerColors[socketId] = this.players.length === 0 ? 0 : 1;
    this.players.push({
      socketId,
      userId,
      username,
      avatarUrl,
      isHost: this.players.length === 0,
      ready: false,
    });

    socket.join(this.roomCode);
    socket.roomCode = this.roomCode;
  }
  addBot() {
    const botPlayer = {
      id: 'bot',
      username: '🤖 Bot',
      avatarUrl: '/assets/bot.png',
      color: 1,
    };
    this.players.push(botPlayer);
  }

  removePlayer(socketId) {
    const playerIndex = this.players.findIndex((p) => p.socketId === socketId);
    if (playerIndex === -1) return;
    const removedPlayer = this.players.splice(playerIndex, 1)[0];
    delete this.playerColors[socketId];
    this.disconnectedAt[socketId] = Date.now();
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
    if (this.vsBot && socketId === 'bot') {
      return this.currentTurn === this.botColor;
    }
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
    if (!chaining && this.isBotTurn()) {
      setTimeout(() => this.makeBotMove(), 1000);
    }

    return {
      pieces: this.gameLogic.pieceManager.pieces,
      currentTurn: this.currentTurn,
      chaining: this.gameLogic.currentValidMoves !== null,
      movablePieces,
      capturedCounts,
      isCapture,
      pieceMoved: true,
      vsBot: this.vsBot,
    };
  }
  makeBotMove() {
    const pieces = this.gameLogic.moveCalculator.getMovablePieces(
      this.botColor
    );
    if (pieces.length === 0) return;

    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    const chains = this.gameLogic.moveCalculator.getValidMoves(piece);
    if (chains.length === 0) return;

    const chain = chains[Math.floor(Math.random() * chains.length)];

    const result = this.handleMove('bot', piece, chain);
    if (this.io && this.roomCode) {
      this.io.to(this.roomCode).emit('highlightMovePath', {
        piece,
        moveChain: chain,
      });

      setTimeout(() => {
        this.io.to(this.roomCode).emit('clearHighlightMovePath');
      }, 700);

      this.io.to(this.roomCode).emit('updateBoard', result);
    }
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
      players: this.players.map(({ socketId, ...rest }) => rest),
      playerColors: this.playerColors, // ✅ бүгдийг client-д өгөх
      currentTurn: this.currentTurn,
      pieces: this.gameLogic.pieceManager.serialize(),
      movablePieces: this.gameLogic.currentMovablePieces,
      moveHistory: this.moveHistory,
      winner: this.winner,
      gameStartedAt: this.gameStartedAt,
      board: this.board.serialize(),
    };
  }

  loadFromData(data) {
    this.roomCode = data.roomCode;
    this.players = data.players.map((p) => ({
      ...p,
      socketId: null, // 🔁 reconnect үед шинэчилнэ
    }));

    this.playerColors = data.playerColors;
    this.currentTurn = data.currentTurn;
    this.moveHistory = data.moveHistory;
    this.winner = data.winner;
    this.gameStartedAt = data.gameStartedAt;
    this.gameEndedAt = data.gameEndedAt;

    this.board = new Board();
    this.board.deserialize(data.board);

    this.gameLogic = new GameLogic(this.board, (winner) => {
      this.io.to(this.roomCode).emit('gameEnded', { winner });
    });

    this.gameLogic.pieceManager.deserialize(data.pieces);
  }
  resetGame() {
    // 1. Шинэ самбар үүсгэх
    this.board = new BoardManager();

    // 2. Түүх болон төлвийг дахин тохируулах
    this.currentTurn = 1;
    this.moveHistory = [];
    this.gameEndedAt = null;
    this.gameStartedAt = Date.now();
    this.winner = null;

    // 3. Тоглогчдыг not-ready болгох
    this.players.forEach((p) => {
      p.ready = false;
    });

    // 4. GameLogic шинэчилж, winner callback дахин оноох
    this.gameLogic = new GameLogic(this.board, (winner) => {
      this.gameEndedAt = Date.now();
      const duration = this.gameEndedAt - this.gameStartedAt;
      const formatetDuration = this.formatDuration(duration);
      this.io.to(this.roomCode).emit('gameEnded', {
        winner,
        formatetDuration,
        moveCount: this.moveHistory.length,
        playerColors: this.playerColors,
        roomCode: this.roomCode,
      });
    });
    this.gameLogic.resetGame(this.currentTurn);
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
