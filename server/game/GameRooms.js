// server/rooms/GameRooms.js
import GameLogic from "./GameLogic.js";
import Board from "../model/Board.js";

export default class GameRooms {
  constructor(roomCode, io) {
    this.roomCode = roomCode;
    this.players = [];
    this.board = new Board();
    this.io = io;
    this.currentTurn = 1;
    this.playerColors = {};

    this.gameLogic = new GameLogic(this.board, (winner) => {
      this.io.to(this.roomCode).emit("gameEnded", { winner });
    });

    this.gameLogic.createInitialPieces();
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
  }

  isPlayerTurn(socketId) {
    return this.players[this.currentTurn] === socketId;
  }

  handleMove(socketId, pieceData, moveData) {
    if (!this.isPlayerTurn(socketId)) return { error: "Таны ээлж биш!" };

    const piece = this.gameLogic.getPieceAt(
      pieceData.fromRow,
      pieceData.fromCol
    );
    if (!piece) return { error: "Чулуу олдсонгүй!" };

    const validMoves = this.gameLogic.getValidMoves(piece);
    const selectedMove = validMoves.find(
      (m) => m.row === moveData.toRow && m.col === moveData.toCol
    );
    if (!selectedMove) return { error: "Буруу нүүдэл!" };

    this.gameLogic.movePieceTo(
      piece,
      moveData.toRow,
      moveData.toCol,
      this.currentTurn
    );

    if (!this.gameLogic.currentValidMoves) {
      this.currentTurn = 1 - this.currentTurn;
    }

    return {
      pieces: this.gameLogic.pieces,
      currentTurn: this.currentTurn,
      chaining: this.gameLogic.currentValidMoves !== null,
    };
  }

  getPlayerColor(socketId) {
    return this.playerColors[socketId] ?? null;
  }
}
