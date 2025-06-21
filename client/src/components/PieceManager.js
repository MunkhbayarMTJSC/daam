import Piece from '../model/piece.js';

export default class PieceManager {
  constructor(scene, board) {
    this.scene = scene;
    this.board = board;
    this.pieces = new Map();
  }

  updatePieces(piecesArray) {
    const updatedIds = new Set();

    for (const data of piecesArray) {
      let piece = this.pieces.get(data.id);

      if (!piece) {
        piece = new Piece(this.scene, this.board, data.row, data.col, data);
        this.pieces.set(data.id, piece);
      } else {
        piece.updatePieceState(data);
      }

      updatedIds.add(data.id);
    }

    // 🧹 Устгагдсан хүүг арилгах
    for (const [id, piece] of this.pieces.entries()) {
      if (!updatedIds.has(id)) {
        piece.destroyPiece();
        this.pieces.delete(id);
      }
    }
  }

  getPieceById(id) {
    return this.pieces.get(id);
  }

  getPieceSpriteAt(id) {
    return this.getPieceById(id) || null;
  }

  clear() {
    for (const piece of this.pieces.values()) {
      piece.destroyPiece();
    }
    this.pieces.clear();
  }
}
