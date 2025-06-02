export default class GameLogic {
  constructor(board, player) {
    this.board = board;
    this.pieces = [];
    this.selectedPieces = null;
    this.currentValidMoves = null;
    this.currentTurn = 2;
  }

  createInitialePieces() {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 10; col++) {
        if ((row + col) % 2 === 1) {
          this.createPieces(col, row, 0); // ← col = x, row = y гэж зөв болгож байна
        }
      }
    }
    for (let row = 7; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if ((row + col) % 2 === 1) {
          this.createPieces(col, row, 2); // ← цагаан хүү
        }
      }
    }
  }

  createPieces(col, row, color) {
    const pieceData = {
      id: `${color}-${col}-${row}-${Date.now()}-${Math.random()}`, // юник id
      row,
      col,
      color,
      isKing: false,
    };

    this.pieces.push(pieceData);
  }

  movePieceTo(pieceData, newRow, newCol) {
    pieceData.row = newRow;
    pieceData.col = newCol;

    const furtherMove = this.getValidMoves(pieceData).filter((m) => m.captured);
    if (furtherMove.length === 0) {
      if (
        (pieceData.color === 0 && newRow === 9) ||
        (pieceData.color === 2 && newRow === 0)
      ) {
        pieceData.isKing = true;
      }
    }
  }

  getPieceAt(row, col) {
    return this.pieces.find((p) => p.row === row && p.col === col);
  }

  // Modified getValidMoves function with King logic explained
  getValidMoves(pieceData) {
    const moves = [];
    // Энгийн нүүдэл зөвхөн урагш
    const moveDirections =
      pieceData.color === 0
        ? [
            [1, -1],
            [1, 1],
          ]
        : [
            [-1, -1],
            [-1, 1],
          ];

    for (const [dr, dc] of moveDirections) {
      const newRow = pieceData.row + dr;
      const newCol = pieceData.col + dc;

      if (
        this.board.isValidTile(newRow, newCol) &&
        !this.getPieceAt(newRow, newCol)
      ) {
        moves.push({ row: newRow, col: newCol });
      }
    }

    // Бүх чиглэлд идэлтийг шалгана
    const captureDirections = [
      [1, -1],
      [1, 1],
      [-1, -1],
      [-1, 1],
    ];

    for (const [dr, dc] of captureDirections) {
      const newRow = pieceData.row + dr;
      const newCol = pieceData.col + dc;
      const jumpRow = pieceData.row + dr * 2;
      const jumpCol = pieceData.col + dc * 2;

      const enemy = this.getPieceAt(newRow, newCol);
      if (
        enemy &&
        enemy.color !== pieceData.color &&
        this.board.isValidTile(jumpRow, jumpCol) &&
        !this.getPieceAt(jumpRow, jumpCol)
      ) {
        moves.push({
          row: jumpRow,
          col: jumpCol,
          captured: enemy,
        });
      }
    }

    return moves;
  }

  hasAnyCaptureMoves(color) {
    for (const pieceData of this.pieces) {
      if (pieceData.color === color) {
        const moves = this.getValidMoves(pieceData);
        if (moves.some((move) => move.captured)) {
          return true;
        }
      }
    }
    return false;
  }
}
