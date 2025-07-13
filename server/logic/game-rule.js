export class GameRules {
  constructor(pieceManager, moveCalculator) {
    this.pieceManager = pieceManager;
    this.moveCalculator = moveCalculator;
  }
  isGameOver(color) {
    const movable = this.moveCalculator.getMovablePieces(color);
    return movable.length === 0;
  }
  mustCapture(color) {
    const movablePieces = this.moveCalculator.getMovablePieces(color);
    return (
      movablePieces.length > 0 &&
      this.moveCalculator.hasCaptureMoves(movablePieces[0])
    );
  }
  getWinner() {
    const pieces = this.getRemainingPieces();
    if (pieces.white > pieces.black) return 1;
    if (pieces.black > pieces.white) return 0;
    return -1;
  }
  getRemainingPieces() {
    return {
      white: this.pieceManager.getAllByColor(1).length,
      black: this.pieceManager.getAllByColor(0).length,
    };
  }
}
