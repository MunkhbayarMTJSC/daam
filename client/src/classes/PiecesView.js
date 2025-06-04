export default class Pieces {
  constructor(scene, board, playerColor) {
    this.scene = scene;
    this.board = board;
    this.playerColor = playerColor;
    this.hightlightGraphics = this.scene.add.graphics();
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

  updateBoardFromServer(piecesArray, currentTurn) {
    this.clearPieces();

    for (const piece of piecesArray) {
      const { id, row, col, color, isKing } = piece;
      const { x, y } = this.board.getTilePosition(row, col);
      const frame = color === 0 ? (isKing ? 3 : 1) : isKing ? 2 : 0;
      const sprite = this.scene.add.sprite(x, y, "pieces", frame);
      this.pieces.set(id, sprite);

      // ✅ Зөвхөн тоглогчийн ээлж болоод өөрийн хүүн дээр даралт идэвхжүүлэх
      const isMyTurn = currentTurn === this.playerColor;
      const isMyPiece = color === this.playerColor;
      if (isMyTurn && isMyPiece) {
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
    this.turnText.setText(currentTurn === 0 ? "Цагаан ээлж" : "Хар ээлж");
  }

  clearPieces() {
    for (const sprite of this.pieces.values()) {
      sprite.destroy();
    }
    this.pieces.clear();
  }

  highlightMoves(piece, moves) {
    this.hightlightGraphics.clear();
    this.validMoveCircles.forEach((c) => c.destroy());
    this.validMoveCircles = [];

    for (const move of moves) {
      // Хүснэгтэн дээр харагдах байрлал автоматаар BoardView дээр хөрвүүлэгдэнэ
      const { x, y } = this.board.getTilePosition(move.row, move.col);

      const circle = this.scene.add
        .circle(x, y, 16, 0x00ff00, 0.3)
        .setInteractive()
        .on("pointerdown", () => {
          this.hightlightGraphics.clear();
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

      circle.setStrokeStyle(2, 0x00ff00);
      circle.setDepth(10);
      this.validMoveCircles.push(circle);
    }
  }
}
