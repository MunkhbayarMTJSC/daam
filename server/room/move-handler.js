export default class MoveHanlder {
  constructor(gameLogic, gameState, timeManager) {
    this.gameLogic = gameLogic;
    this.gameState = gameState;
    this.timeManager = timeManager;
  }
  handleMove(socketId, pieceData, moveChain) {
    if (!this.gameState.isPlayerTurn(socketId))
      return { error: 'Таны ээлж биш!' };

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
        this.gameState.currentTurn
      );
    } else {
      this.gameLogic.moveSimple(
        piece,
        matchedChain[0],
        this.gameState.currentTurn
      );
    }

    this.gameState.moveHistory.push({
      pieceId: piece.id,
      path: matchedChain.map(({ row, col }) => ({ row, col })),
      isCapture,
      turn: this.gameState.currentTurn,
    });
    this.timeManager.updateTimeAfterMove(this.gameState.currentTurn);

    if (!chaining) {
      this.gameState.currentTurn = 1 - this.gameState.currentTurn;
      this.timeManager.startPlayerClock(this.gameState.currentTurn);
    }

    const movablePieces = this.gameLogic.updateMovablePieces(
      this.gameState.currentTurn
    );
    const capturedCounts = this.calculateCapturedCounts();

    return {
      pieces: this.gameLogic.pieceManager.pieces,
      currentTurn: this.gameState.currentTurn,
      chaining: this.gameLogic.currentValidMoves !== null,
      movablePieces,
      capturedCounts,
      isCapture,
      pieceMoved: true,
      vsBot: this.gameState.vsBot,
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
  calculateCapturedCounts() {
    const player1Pieces = this.gameLogic.pieceManager.getAllByColor(0);
    const player2Pieces = this.gameLogic.pieceManager.getAllByColor(1);

    return {
      0: 20 - player1Pieces.length,
      1: 20 - player2Pieces.length,
    };
  }
}
