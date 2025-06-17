export class PiecesManager {
  constructor(board) {
    this.board = board;
    this.pieces = [];
  }

  createInitialPieces() {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < this.board.size; col++) {
        if ((row + col) % 2 === 1) this.createPiece(col, row, 0);
      }
    }
    for (let row = 6; row < this.board.size; row++) {
      for (let col = 0; col < this.board.size; col++) {
        if ((row + col) % 2 === 1) this.createPiece(col, row, 1);
      }
    }
  }

  createPiece(col, row, color) {
    const piece = {
      id: `${color}-${col}-${row}-${Date.now()}-${Math.random()}`,
      col,
      row,
      color,
      isKing: false,
    };
    this.pieces.push(piece);
  }
  clearPieces() {
    this.pieces = [];
  }

  getPieceAt(row, col) {
    return this.pieces.find((p) => p.row === row && p.col === col);
  }

  removePiece(id) {
    this.pieces = this.pieces.filter((p) => p.id !== id);
  }

  promoteIfNeeded(piece) {
    if (this.board.isEdge(piece.row, piece.color)) {
      piece.isKing = true;
    }
  }

  getAllByColor(color) {
    return this.pieces.filter((p) => p.color === color);
  }
  getPieceById(id) {
    return this.pieces.filter((p) => p.id === id);
  }
  serialize() {
    return this.pieces.map((p) => ({
      id: p.id,
      row: p.row,
      col: p.col,
      color: p.color,
      isKing: p.isKing,
    }));
  }

  deserialize(data) {
    this.pieces = data.map((p) => ({
      id: p.id,
      row: p.row,
      col: p.col,
      color: p.color,
      isKing: p.isKing,
    }));
  }
}
