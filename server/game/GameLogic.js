// server/game/GameLogic.js
export default class GameLogic {
  constructor(board) {
    this.board = board;
    this.pieces = [];
    this.selectedPieces = null;
    this.currentValidMoves = null;
    this.currentTurn = 1; // 0 = хар, 1 = цагаан
  }

  createInitialPieces() {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 10; col++) {
        if ((row + col) % 2 === 1) {
          this.createPiece(col, row, 0); // Хар хүү
        }
      }
    }

    for (let row = 7; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if ((row + col) % 2 === 1) {
          this.createPiece(col, row, 1); // Цагаан хүү
        }
      }
    }
  }

  createPiece(col, row, color) {
    const pieceData = {
      id: `${color}-${col}-${row}-${Date.now()}-${Math.random()}`,
      row,
      col,
      color,
      isKing: false,
    };

    this.pieces.push(pieceData);
  }

  getPieceAt(row, col) {
    return this.pieces.find((p) => p.row === row && p.col === col);
  }

  movePieceTo(pieceData, newRow, newCol) {
    const mustCapture = this.hasAnyCaptureMoves(this.currentTurn);
    const move = this.getValidMoves(pieceData).find(
      (m) => m.row === newRow && m.col === newCol
    );

    if (!move) return;
    if (mustCapture && !move.captured) {
      // Заавал идэх нүүдэл хийх ёстой тул ийм нүүдэл хууль бус
      console.log("Заавал идэх нүүдэл хийх ёстой!");
      return;
    }

    // Идсэн хүү байвал устгана
    if (move.captured) {
      this.pieces = this.pieces.filter((p) => p !== move.captured);
      pieceData.row = newRow;
      pieceData.col = newCol;

      // Хүүг хаан болгох
      if (
        (pieceData.color === 0 && newRow === 9) ||
        (pieceData.color === 1 && newRow === 0)
      ) {
        pieceData.isKing = true;
      }

      // Дараалсан идэлт шалгах
      const furtherMoves = this.getValidMoves(pieceData).filter(
        (m) => m.captured
      );

      if (furtherMoves.length > 0) {
        this.selectedPieces = pieceData;
        this.currentValidMoves = furtherMoves;
        return; // ⚠️ Ээлж шилжүүлэхгүй
      }
    } else {
      // Энгийн нүүдэл
      pieceData.row = newRow;
      pieceData.col = newCol;

      // Хүүг хаан болгох
      if (
        (pieceData.color === 0 && newRow === 9) ||
        (pieceData.color === 1 && newRow === 0)
      ) {
        pieceData.isKing = true;
      }
      // 🌀 Ээлжийг солих
      this.selectedPieces = null;
      this.currentValidMoves = null;
      this.currentTurn = this.currentTurn === 0 ? 1 : 0;
    }
  }

  getPiecesWithCaptureMoves(color) {
    return this.pieces.filter(
      (p) => p.color === color && this.getValidMoves(p).some((m) => m.captured)
    );
  }

  getValidMoves(pieceData) {
    const moves = [];

    const captureDirections = [
      [1, -1],
      [1, 1],
      [-1, -1],
      [-1, 1],
    ];

    if (pieceData.isKing) {
      // KING: бүх чиглэлд урт нүүдэл болон идэлт
      for (const [dr, dc] of captureDirections) {
        let row = pieceData.row + dr;
        let col = pieceData.col + dc;
        let hasCaptured = false;
        let captured = null;

        while (this.board.isValidTile(row, col)) {
          const other = this.getPieceAt(row, col);
          if (!other && !hasCaptured) {
            // Энгийн чөлөөтэй нүүдэл
            moves.push({ row, col });
          } else if (other && other.color !== pieceData.color && !hasCaptured) {
            // дайсны хүүг олсон, шалгах
            captured = other;
            hasCaptured = true;
          } else if (hasCaptured && !other) {
            // идэлтийн дараах зайтай талбай
            moves.push({ row, col, captured });
          } else {
            break;
          }
          row += dr;
          col += dc;
        }
      }
    } else {
      // Энгийн хүү: зөвхөн урагш чиглэлд нүүдэл
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
    }

    return moves;
  }

  hasAnyCaptureMoves(playerColor) {
    return this.pieces.some(
      (piece) =>
        piece.color === playerColor &&
        this.getValidMoves(piece).some((move) => move.captured)
    );
  }
}
