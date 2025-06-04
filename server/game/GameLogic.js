// server/game/GameLogic.js
export default class GameLogic {
  constructor(board, onGameOver) {
    this.board = board;
    this.pieces = [];
    this.selectedPieces = null;
    this.currentValidMoves = null;
    this.currentMovablePieces = [];
    this.onGameOver = onGameOver;
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
    this.updateMovablePieces(1);
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

  movePieceTo(pieceData, newRow, newCol, currentTurn) {
    const mustCapture = this.hasAnyCaptureMoves(currentTurn);
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
        this.updateMovablePieces(currentTurn);
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
    }
    if (this.checkGameOver(1 - currentTurn)) {
      if (this.onGameOver) {
        this.onGameOver(currentTurn); // 🎯 GameRoom руу мэдэгдэнэ
      }

      return;
    }

    // 🌀 Ээлжийг солих
    this.selectedPieces = null;
    this.currentValidMoves = null;
    this.updateMovablePieces(1 - currentTurn);
  }

  getPiecesWithCaptureMoves(color) {
    return this.pieces.filter(
      (p) => p.color === color && this.getValidMoves(p).some((m) => m.captured)
    );
  }

  getValidMoves(pieceData) {
    const moves = [];
    const captureMoves = [];

    const captureDirections = [
      [1, -1],
      [1, 1],
      [-1, -1],
      [-1, 1],
    ];

    if (pieceData.isKing) {
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
            captureMoves.push({ row, col, captured });
          } else {
            break;
          }
          row += dr;
          col += dc;
        }
      }
    } else {
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

      // Энгийн нүүдэлүүд
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

      // Идэх нүүдэлүүд
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
          captureMoves.push({
            row: jumpRow,
            col: jumpCol,
            captured: enemy,
          });
        }
      }
    }

    // Хэрэв идэх нүүдэл байгаа бол зөвхөн идэх нүүдлийг буцаах
    if (captureMoves.length > 0) {
      return captureMoves;
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

  // Тухайн ээлжинд нүүх боломжтой хүүнүүдийг шинэчлэнэ
  updateMovablePieces(playerColor) {
    const hasCapture = this.hasAnyCaptureMoves(playerColor);
    if (hasCapture) {
      this.currentMovablePieces = this.getPiecesWithCaptureMoves(playerColor);
    } else {
      this.currentMovablePieces = this.pieces.filter(
        (p) => p.color === playerColor && this.getValidMoves(p).length > 0
      );
    }
  }
  checkGameOver(currentTurn) {
    const playerPieces = this.pieces.filter((p) => p.color === currentTurn);
    if (playerPieces.length === 0) {
      return true;
    }
    for (const piece of playerPieces) {
      const moves = this.getValidMoves(piece);
      if (moves.length > 0) {
        return false;
      }
    }
    return true;
  }
}
