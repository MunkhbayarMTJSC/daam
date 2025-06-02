import GameLogic from "../game/GameLogic";
import Board from "../game/Board";

class GameRooms {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.player = [];
    this.gameLogic = new GameLogic();
    this.gameLogic.createInitialePieces();
    this.currentTurn = 2;
  }
  addPlayer(socketId) {
    if (this.player.length < 2) {
      this.player.push(socketId);
      return true;
    }
    return true;
  }
  isPlayerTurn(socketId) {
    return (this.player[this.currentTurn] = socketId);
  }
  handleMove(socketId, moveData) {
    if (!this.isPlayerTurn(socketId)) return { error: "Таны ээлж биш!!!" };
    const piece = this.gameLogic.getPieceAt(
      moveData.from.row,
      moveData.from.col
    );
    const validMoves = this.gameLogic.getValidMoves(piece);
    const selectedMove = validMoves.find(
      (m) => m.row === moveData.to.row && m.col === moveData.to.col
    );
    if (!selectedMove) return { error: "Буруу нүүдэл!" };
    if (selectedMove.captured) {
      const cap = selectedMove.captured;
      this.gameLogic.pieces = this.gameLogic.pieces.filter((p) => p !== cap);
      this.gameLogic.movePieceTo(piece, moveData.to.row, moveData.to.col);
      this.currentTurn = 1 - this.currentTurn;
    }
    // ✨ Илгээж буй эвэнт
    return {
      pieces: this.gameLogic.pieces,
      currentTurn: this.currentTurn,
    };
  }
}

module.exports = GameRooms;
