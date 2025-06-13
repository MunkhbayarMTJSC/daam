export default class PieceManager {
  constructor(scene, board, playerColor) {
    this.scene = scene;
    this.board = board;
    this.playerColor = playerColor;
    this.pieces = new Map();
  }
  updatePieces(piecesArray) {
    const updatedIds = new Set();

    for (const piece of piecesArray) {
      let sprite = this.pieces.get(piece.id);

      if (!sprite) {
        sprite = this.createPieceSprite(piece);
        this.pieces.set(piece.id, sprite);
      } else {
        // 🟡 Зөвхөн row, col-г update хийнэ, sprite.setPosition() хийхгүй
        sprite.row = piece.row;
        sprite.col = piece.col;

        const frame =
          piece.color === 0 ? (piece.isKing ? 2 : 3) : piece.isKing ? 0 : 1;
        sprite.setFrame(frame);
      }

      updatedIds.add(piece.id);
    }

    // 🧹 Устгагдсан хүүг арилгах
    for (const [id, sprite] of this.pieces.entries()) {
      if (!updatedIds.has(id)) {
        sprite.destroy();
        this.pieces.delete(id);
      }
    }
  }

  createPieceSprite(piece) {
    const { id, row, col, color, isKing } = piece;
    const frame = color === 0 ? (isKing ? 2 : 3) : isKing ? 0 : 1;
    const { x, y } = this.board.getTilePosition(row, col);
    const sprite = this.scene.add.sprite(x, y, 'pieces', frame).setScale(0.45);
    sprite.setOrigin(0.5, 0.5);
    sprite.setDepth(9);
    sprite.id = id;
    sprite.row = row;
    sprite.col = col;
    return sprite;
  }
  getPieceById(id) {
    return this.pieces.get(id);
  }

  getPieceSpriteAt(id) {
    for (const sprite of this.pieces.values()) {
      if (sprite.id === id) {
        return sprite;
      }
    }
    return null;
  }

  clear() {
    for (const sprite of this.pieces.values()) {
      sprite.destroy();
    }
    this.pieces.clear();
  }
}
