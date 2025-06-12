// server/rooms/GameRooms.js
import GameLogic from './GameLogic.js';
import Board from '../model/BoardManager.js';

export default class GameRooms {
  constructor(roomCode, io) {
    this.roomCode = roomCode;
    this.players = [];
    this.board = new Board();
    this.io = io;
    this.currentTurn = 1;
    this.playerColors = {};
    this.moveHistory = [];
    this.disconnectedAt = {};
    this.gameStartedAt = Date.now();
    this.gameEndedAt = null;
    this.winner = null;
    this.gameLogic = new GameLogic(this.board, (winner) => {
      this.io.to(this.roomCode).emit('gameEnded', { winner });
    });

    this.gameLogic.startGame();
  }

  addPlayer(socketId) {
    if (this.players.length >= 2) return false;
    this.players.push(socketId);
    this.playerColors[socketId] = this.players.length === 1 ? 0 : 1;
    return true;
  }

  removePlayer(socketId) {
    const idx = this.players.indexOf(socketId);
    if (idx !== -1) {
      this.players.splice(idx, 1);
    }
    this.disconnectedAt[socketId] = Date.now();
  }

  isPlayerTurn(socketId) {
    return this.players[this.currentTurn] === socketId;
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
      this.gameLogic.moveSimple(piece, matchedChain[0]); // simple move has 1 step
    }

    // ✅ НҮҮДЛИЙН ТҮҮХЭД БҮРТГЭХ хэсэг
    this.moveHistory.push({
      pieceId: piece.id,
      path: matchedChain.map(({ row, col }) => ({ row, col })),
      isCapture,
      turn: this.currentTurn,
    });

    if (!chaining) this.currentTurn = 1 - this.currentTurn;

    const movablePieces = this.gameLogic.updateMovablePieces(this.currentTurn);
    return {
      pieces: this.gameLogic.pieceManager.pieces,
      currentTurn: this.currentTurn,
      chaining: this.gameLogic.currentValidMoves !== null,
      movablePieces,
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

  getPlayerColor(socketId) {
    return this.playerColors[socketId] ?? null;
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
}
