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
    const whiteAlive = this.pieceManager.getAllByColor(1);
    const blackAlive = this.pieceManager.getAllByColor(0);
    const whiteCanMove = whiteAlive.some(
      (p) => this.moveCalculator.getValidMoves(p).length > 0
    );
    const blackCanMove = blackAlive.some(
      (p) => this.moveCalculator.getValidMoves(p).length > 0
    );
    if (!whiteAlive.length || !whiteCanMove) return 0; // Black wins
    if (!blackAlive.length || !blackCanMove) return 1; // White wins
    return null;
  }
  getRemainingPieces() {
    return {
      white: this.pieceManager.getAllByColor(1).length,
      black: this.pieceManager.getAllByColor(0).length,
    };
  }
}
