// server/rooms/GameRooms.js
import GameLogic from "../game/GameLogic.js";
import Board from "../game/Board.js";

export default class GameRooms {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.players = [];
    this.board = new Board();
    this.gameLogic = new GameLogic(this.board);
    this.gameLogic.createInitialPieces();
    this.currentTurn = 1;
    this.playerColors = {};
    const logic = new GameLogic(this.board, (winner) => {
      io.to(roomCode).emit("gameEnded", { winner });
    });
  }
  addPlayer(socketId) {
    if (this.players.length >= 2) return false;

    this.players.push(socketId);

    // ☑️ Шууд өнгө оноох
    const color = this.players.length === 1 ? 0 : 1; // Эхний хүн бол цагаан (1), дараагийнх нь хар (0)
    this.playerColors[socketId] = color;

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
    if (!this.isPlayerTurn(socketId)) {
      return { error: "Таны ээлж биш!!!" };
    }

    const piece = this.gameLogic.getPieceAt(
      pieceData.fromRow,
      pieceData.fromCol
    );
    if (!piece) {
      return { error: "Нүүдэл хийх чулуу олдсонгүй!" };
    }

    const validMoves = this.gameLogic.getValidMoves(piece);
    const selectedMove = validMoves.find(
      (m) => m.row === moveData.toRow && m.col === moveData.toCol
    );

    if (!selectedMove) {
      return { error: "Буруу нүүдэл!" };
    }

    // Чулууг хөдөлгөнө (устгах логик дотор нь байгаа)
    this.gameLogic.movePieceTo(
      piece,
      moveData.toRow,
      moveData.toCol,
      this.currentTurn
    );

    // Дараагийн идэлт байгаа эсэхийг шалгаад ээлжийг солих
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
