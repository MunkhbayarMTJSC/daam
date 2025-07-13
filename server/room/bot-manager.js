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
    return this.gameState.currentTurn === this.gameState.botColor;
  }
  evaluiteChain(chain) {
    let score = 0;
    for (const step of chain) {
      if (step.captured) score += 10;
    }
    return score;
  }
  evaluiteMoves(piece, chains) {
    let bestScore = -Infinity;
    let bestChain = null;
    for (const chain of chains) {
      const score = this.evaluiteChain(chain);
      if (score > bestScore) {
        bestScore = score;
        bestChain = chain;
      }
    }
    return bestChain;
  }

  makeMove() {
    const pieces = this.gameLogic.moveCalculator.getMovablePieces(
      this.gameState.botColor
    );
    if (pieces.length === 0) return;

    let bestPiece = null;
    let bestChain = null;
    let bestScore = -Infinity;

    for (const piece of pieces) {
      const validChains = this.gameLogic.moveCalculator.getValidMoves(piece);
      if (!validChains.length) continue;

      const chosenChain = this.evaluiteMoves(piece, validChains);
      const score = this.evaluiteChain(chosenChain);

      if (score > bestScore) {
        bestScore = score;
        bestPiece = piece;
        bestChain = chosenChain;
      }
    }

    if (!bestPiece || !bestChain) return;

    const result = this.moveHandler.handleMove('bot', bestPiece, bestChain);
    this.io.to(this.roomCode).emit('highlightMovePath', {
      piece: bestPiece,
      moveChain: bestChain,
    });

    if (!result.pieceMoved) return;

    setTimeout(() => {
      this.io.to(this.roomCode).emit('clearHighlightMovePath');
      this.io.to(this.roomCode).emit('updateBoard', result);
    }, 700);
  }
}
