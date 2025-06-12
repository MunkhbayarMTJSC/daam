export class MoveCalculator {
  constructor(board, pieceManager) {
    this.board = board;
    this.pieceManager = pieceManager;
  }

  getValidMoves(piece, captureOnly = false) {
    const captureChains = this.getCaptureChains(piece);

    if (captureChains.length > 0) {
      const maxLength = Math.max(...captureChains.map((chain) => chain.length));
      const filtered = captureChains.filter(
        (chain) => chain.length === maxLength
      );
      return captureOnly ? filtered : filtered;
    }
    if (captureOnly) return [];

    const simpleMoves = [];
    const directions = this.getDirections(piece);

    for (const [dr, dc] of directions) {
      let row = piece.row + dr;
      let col = piece.col + dc;

      // Даам олон алхам хийнэ, хүү бол зөвхөн 1
      const maxSteps = piece.isKing ? this.board.size : 2;

      for (let step = 1; step < maxSteps; step++) {
        if (!this.board.isValidTile(row, col)) break;

        const occupant = this.pieceManager.getPieceAt(row, col);

        if (!occupant) {
          simpleMoves.push([{ row, col, captured: null }]);
        } else {
          break; // замд ямар нэг чулуу байвал зогсооно
        }

        row += dr;
        col += dc;

        if (!piece.isKing) break; // хүү бол зөвхөн 1 алхам хийнэ
      }
    }

    return simpleMoves;
  }

  getCaptureChains(piece, visitedCaptures = new Set()) {
    const chains = [];
    const directions = this.getDirections(piece, true); // бүх чиглэл

    for (const [dr, dc] of directions) {
      const maxSteps = piece.isKing ? this.board.size : 2;
      let row = piece.row + dr;
      let col = piece.col + dc;
      let captured = null;

      for (let step = 1; step < maxSteps; step++) {
        if (!this.board.isValidTile(row, col)) break;

        const occupant = this.pieceManager.getPieceAt(row, col);

        if (occupant) {
          // Өөрийн хүн бол эсвэл аль хэдийн нэг дайсан алгассан бол болиулах
          if (captured || occupant.color === piece.color) break;

          captured = occupant;
          row += dr;
          col += dc;

          while (
            this.board.isValidTile(row, col) &&
            !this.pieceManager.getPieceAt(row, col)
          ) {
            const captureKey = captured.id;

            if (visitedCaptures.has(captureKey)) break; // аль хэдийн идсэн дайсан

            // Дараагийн алхамын шинэ байрлал
            const nextPiece = { ...piece, row, col };

            const newVisited = new Set(visitedCaptures);
            newVisited.add(captureKey);

            const subChains = this.getCaptureChains(nextPiece, newVisited);

            const move = {
              row,
              col,
              captured: {
                id: captured.id,
                row: captured.row,
                col: captured.col,
              },
            };

            if (subChains.length > 0) {
              for (const chain of subChains) {
                chains.push([move, ...chain]);
              }
            } else {
              chains.push([move]);
            }

            if (!piece.isKing) break;

            row += dr;
            col += dc;
          }

          break; // нэг дайсны цаана хоосон талбай олсон тул өөр дайсан хайхгүй
        }

        if (!piece.isKing) break;

        row += dr;
        col += dc;
      }
    }

    return chains;
  }

  hasCaptureMoves(piece) {
    return this.getCaptureChains(piece).length > 0;
  }

  getMovablePieces(color) {
    const pieces = this.pieceManager.getAllByColor(color);

    const captureMovesMap = new Map();

    for (const p of pieces) {
      const chains = this.getCaptureChains(p);
      if (chains.length > 0) {
        const maxLen = Math.max(...chains.map((c) => c.length));
        captureMovesMap.set(p, maxLen);
      }
    }

    if (captureMovesMap.size > 0) {
      const globalMax = Math.max(...captureMovesMap.values());
      return [...captureMovesMap.entries()]
        .filter(([_, len]) => len === globalMax)
        .map(([p, _]) => p);
    }

    return pieces.filter((p) => this.getValidMoves(p).length > 0);
  }

  getDirections(piece, forCapture = false) {
    if (piece.isKing || forCapture) {
      return [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]; // бүх чиглэл
    }

    // хүүгийн энгийн урагшаа чиглэл
    return piece.color === 0
      ? [
          [1, -1],
          [1, 1],
        ]
      : [
          [-1, -1],
          [-1, 1],
        ];
  }
}
