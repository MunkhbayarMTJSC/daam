export default class Pieces {
  constructor(scene, board, playerColor) {
    this.scene = scene;
    this.board = board;
    this.playerColor = playerColor;
    this.highlightGraphics = this.scene.add.graphics();
    this.glowHighlights = [];
    this.validMoveCircles = [];
    this.turnText = this.scene.add.text(10, 30, "Цагаан ээлж", {
      font: "20px Arial",
      fill: "#ffffff",
    });
    this.pieces = new Map(); // id → sprite
    this.scene.socket.on("highlightMoves", ({ piece, moves }) => {
      this.highlightMoves(piece, moves);
    });
  }

  updateBoardFromServer(piecesArray, currentTurn, movablePieces) {
    this.clearPieces();
    const movablePieceIds = new Set(movablePieces.map((p) => p.id));
    for (const piece of piecesArray) {
      const { id, row, col, color, isKing } = piece;
      const { x, y } = this.board.getTilePosition(row, col);
      const frame = color === 0 ? (isKing ? 3 : 1) : isKing ? 2 : 0;
      const sprite = this.scene.add.sprite(x, y, "pieces", frame);
      sprite.row = row;
      sprite.col = col;
      this.pieces.set(id, sprite);

      // ✅ Зөвхөн тоглогчийн ээлж болоод өөрийн хүүн дээр даралт идэвхжүүлэх
      const isMyTurn = currentTurn === this.playerColor;
      const isMyPiece = color === this.playerColor;
      const isMovable = movablePieceIds.has(id);
      if (isMyTurn && isMyPiece && isMovable) {
        sprite.setInteractive();
        sprite.on("pointerdown", () => {
          this.scene.socket.emit("selectedPiece", {
            roomCode: this.scene.roomCode,
            pieceId: id,
          });
        });
      }
    }
    // 📝 Ээлжийн текст шинэчлэх
    this.highlightMovablePieces(movablePieces); // highlight хийх
    this.turnText.setText(currentTurn === 0 ? "Цагаан ээлж" : "Хар ээлж");
  }
  getPieceSpriteAt(row, col) {
    for (const sprite of this.pieces.values()) {
      if (sprite.row === row && sprite.col === col) {
        return sprite;
      }
    }
    return null;
  }

  clearPieces() {
    for (const sprite of this.pieces.values()) {
      sprite.destroy();
    }
    this.pieces.clear();
  }

  highlightMoves(piece, moves) {
    this.highlightGraphics.clear();
    this.validMoveCircles.forEach((c) => c.destroy());
    this.validMoveCircles = [];

    for (const move of moves) {
      // Хүснэгтэн дээр харагдах байрлал автоматаар BoardView дээр хөрвүүлэгдэнэ
      const { x, y } = this.board.getTilePosition(move.row, move.col);

      const rect = this.scene.add
        .rectangle(x, y, 45, 45, 0xffffff, 0.3) // цагаан өнгө, 30% тунгалаг
        .setInteractive()
        .on("pointerdown", () => {
          this.highlightGraphics.clear();
          this.validMoveCircles.forEach((c) => c.destroy());
          this.validMoveCircles = [];

          this.scene.socket.emit("playerMove", {
            roomCode: this.scene.roomCode,
            piece: {
              fromRow: piece.row,
              fromCol: piece.col,
            },
            move: {
              toRow: move.row,
              toCol: move.col,
            },
          });
        });

      rect.setStrokeStyle(2, 0xffffff); // Гадна хүрээ
      rect.setDepth(10);
      this.validMoveCircles.push(rect);
    }
  }
  highlightMovablePieces(movablePieces) {
    this.clearHighlights();

    for (const piece of movablePieces) {
      const sprite = this.getPieceSpriteAt(piece.row, piece.col);
      if (sprite) {
        sprite.setDepth(10);

        // Нэг graphics объект бүртгэж авъя
        const glow = this.scene.add.graphics();
        glow.fillStyle(0x37cb71, 0.5);
        glow.fillRoundedRect(sprite.x - 22, sprite.y - 22, 45, 45, 5);
        glow.lineStyle(2, 0x37cb71, 1);
        glow.strokeRoundedRect(sprite.x - 22, sprite.y - 22, 45, 45, 5);
        glow.setDepth(9);

        // Анивчуулах эффект
        this.scene.tweens.add({
          targets: glow,
          alpha: 0.2,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        this.glowHighlights.push(glow); // Энэ графикийг дараа цэвэрлэхэд хадгалах болбол array-д нэмэх хэрэгтэй
      }
    }
  }

  clearHighlights() {
    this.highlightGraphics.clear();
    this.validMoveCircles.forEach((c) => c.destroy());
    this.validMoveCircles = [];

    // 🧹 Анивчигч графикуудыг устгах
    this.glowHighlights.forEach((glow) => glow.destroy());
    this.glowHighlights = [];

    for (const sprite of this.pieces.values()) {
      sprite.clearTint();
    }
  }
}
