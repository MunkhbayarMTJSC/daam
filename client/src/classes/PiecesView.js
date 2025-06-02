export default class Pieces {
  constructor(scene, board) {
    this.scene = scene;
    this.board = board;
    this.hightlightGraphics = this.scene.add.graphics();
    this.turnText = this.scene.add.text(10, 30, "Цагаан ээлж", {
      font: "20px Arial",
      fill: "#ffffff",
    });
    this.pieces = new Map(); // id → sprite
  }
  updateBoardFromServer(piecesArray, currentTurn) {
    this.clearPieces();
    for (const piece of piecesArray) {
      const { id, row, col, color, isKing } = piece;
      const { x, y } = this.board.getTilePosition(row, col);
      const frame = color === 0 ? (isKing ? 1 : 0) : isKing ? 3 : 2;
      const sprite = this.scene.add.sprite(x + 1, y + 1, "pieces", frame);
      this.pieces.set(id, sprite);
    }
    this.turnText.setText(currentTurn === 0 ? "Хар ээлж" : "Цагаан ээлж");
  }
  clearPieces() {
    for (const sprite of this.pieces.values()) {
      sprite.destroy();
    }
    this.pieces.clear();
  }
  highlightMoves(moves) {
    this.hightlightGraphics.clear();
    this.hightlightGraphics.lineStyle(2, 0x00ff00, 1);
    this.hightlightGraphics.fillStyle(0x00ff00, 0.3);
    for (const move of moves) {
      const { x, y } = this.board.getTilePosition(move.row, move.col);
      this.hightlightGraphics.fillCircle(x, y, 12);
      this.hightlightGraphics.strokeCircle(x, y, 12);
    }
  }
}
