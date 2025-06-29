// GameRoom/BotManager.js
export default class BotManager {
  constructor(gameLogic, moveHandler, gameState, io, roomCode) {
    this.gameLogic = gameLogic;
    this.moveHandler = moveHandler;
    this.gameState = gameState;
    this.io = io;
    this.roomCode = roomCode;
  }

  isBotTurn() {
    return (
      this.gameState.vsBot &&
      this.gameState.currentTurn === this.gameState.botColor
    );
  }

  makeMove() {
    const pieces = this.gameLogic.moveCalculator.getMovablePieces(
      this.gameState.botColor
    );
    if (pieces.length === 0) return;

    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    const chains = this.gameLogic.moveCalculator.getValidMoves(piece);
    if (chains.length === 0) return;

    const chain = chains[Math.floor(Math.random() * chains.length)];
    const result = this.moveHandler.handleMove('bot', piece, chain);

    if (!result.pieceMoved) return;

    this.io.to(this.roomCode).emit('highlightMovePath', {
      piece,
      moveChain: chain,
    });

    setTimeout(() => {
      this.io.to(this.roomCode).emit('clearHighlightMovePath');
      this.io.to(this.roomCode).emit('updateBoard', result);
    }, 700);
  }
}
