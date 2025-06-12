export default class Pieces {
  constructor(scene, board, playerColor) {
    this.scene = scene;
    this.board = board;
    this.playerColor = playerColor;
    this.glowHighlights = [];
    this.validMoveCircles = [];
    this.selectedGlow = null;
    this.selectedTween = null;

    this.turnText = this.scene.add.text(10, 30, 'Цагаан ээлж', {
      font: '20px Arial',
      fill: '#ffffff',
    });

    this.pieces = new Map();

    this.scene.socket.off('highlightMoves');
    this.scene.socket.on('highlightMoves', ({ piece, moves }) => {
      this.highlightMoves(piece, moves);
    });
  }

  updateBoardFromServer(piecesArray, currentTurn, movablePieces) {
    this.clearPieces();
    const movablePieceIds = new Set(
      Array.isArray(movablePieces) ? movablePieces.map((p) => p.id) : []
    );

    for (const piece of piecesArray) {
      const { id, row, col, color, isKing } = piece;
      const { x, y } = this.board.getTilePosition(row, col);
      const frame = color === 0 ? (isKing ? 2 : 3) : isKing ? 0 : 1;

      const sprite = this.scene.add
        .sprite(x, y, 'pieces', frame)
        .setScale(0.45);
      sprite.row = row;
      sprite.col = col;
      this.pieces.set(id, sprite);
      sprite.setDepth(9);

      const isMyTurn = currentTurn === this.playerColor;
      const isMyPiece = color === this.playerColor;
      const isMovable = movablePieceIds.has(id);
      if (isMyTurn && isMyPiece && isMovable) {
        sprite.setInteractive();
        sprite.on('pointerdown', () => {
          this.scene.socket.emit('selectedPiece', {
            roomCode: this.scene.roomCode,
            pieceId: id,
          });
          this.highlightSelectedPiece(sprite); // 👈 Сонгосон хүүг онцолно
        });
      }
    }

    this.highlightMovablePieces(movablePieces || []);
    this.turnText.setText(currentTurn === 0 ? 'Цагаан ээлж' : 'Хар ээлж');
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

  highlightMoves(piece, moveChains) {
    this.clearHighlights({ keepSelected: true });
    this.highlightMovePath(moveChains, piece);
    for (const chain of moveChains) {
      const lastMove = chain[chain.length - 1];
      const { x, y } = this.board.getTilePosition(lastMove.row, lastMove.col);

      // 🟢 Add circular indicator
      const square = this.scene.add
        .rectangle(x, y, 40, 40, 0xa5d674, 0.7)
        .setDepth(10)
        .setInteractive()
        .on('pointerdown', () => this.sendMove(piece, chain));

      this.validMoveCircles.push(square); // нэр нь үлдэж болно, гэхдээ 'validMoveSquares' бол илүү утгатай
    }
  }

  sendMove(piece, chain) {
    this.highlightMovePath(chain, piece);
    this.clearHighlights();
    this.scene.socket.emit('playerMove', {
      roomCode: this.scene.roomCode,
      piece: {
        id: piece.id,
      },
      moveChain: chain.map(({ row, col, captured }) => ({
        row,
        col,
        capturedIds: Array.isArray(captured)
          ? captured.map((c) => c.id)
          : captured
          ? [captured.id]
          : [],
      })),
    });
  }

  highlightMovablePieces(movablePieces) {
    this.clearHighlights({ keepSelected: true });

    for (const piece of movablePieces) {
      const sprite = this.getPieceSpriteAt(piece.row, piece.col);
      if (sprite && piece.color === this.playerColor) {
        sprite.setDepth(10);

        const glow = this.scene.add.graphics();
        glow.fillStyle(0x197745, 1);
        glow.fillRect(sprite.x - 20, sprite.y - 20, 40, 40);
        glow.setDepth(9);
        this.glowHighlights.push(glow);
      }
    }
  }
  highlightSelectedPiece(sprite) {
    // 🧼 Хуучны glow болон tween-г устгах
    if (this.selectedGlow) {
      this.selectedGlow.destroy();
      this.selectedGlow = null;
    }
    if (this.selectedTween) {
      this.selectedTween.stop();
      this.selectedTween = null;
    }

    const glow = this.scene.add.graphics();
    glow.fillStyle(0x197745, 1);
    glow.fillRect(sprite.x - 20, sprite.y - 20, 40, 40);
    glow.setDepth(8);

    this.selectedGlow = glow;

    this.selectedTween = this.scene.tweens.add({
      targets: sprite,
      scaleX: 0.55,
      scaleY: 0.55,
      yoyo: true,
      duration: 300,
      repeat: -1,
    });
  }
  highlightMovePath(moveChain, piece) {
    if (!Array.isArray(moveChain) || moveChain.length === 0) return;

    const graphics = this.scene.add.graphics();
    graphics.lineStyle(4, 0xffd700, 0.8);
    graphics.beginPath();

    // Эхлэл: piece-ийн байрлал
    const start = this.board.getTilePosition(piece.row, piece.col);
    graphics.moveTo(start.x, start.y);

    for (const move of moveChain) {
      const { x, y } = this.board.getTilePosition(move.row, move.col);
      graphics.lineTo(x, y);
    }

    graphics.strokePath();
    graphics.setDepth(7);

    this.scene.time.delayedCall(1000, () => {
      graphics.destroy();
    });
  }

  clearHighlights({ keepSelected = false } = {}) {
    this.validMoveCircles.forEach((c) => c.destroy());
    this.validMoveCircles = [];

    this.glowHighlights.forEach((g) => g.destroy());
    this.glowHighlights = [];

    for (const sprite of this.pieces.values()) {
      sprite.clearTint();
    }

    // 🔥 Сонгосон хүүг арилгах эсэхийг сонгож болно
    if (!keepSelected) {
      if (this.selectedGlow) {
        this.selectedGlow.destroy();
        this.selectedGlow = null;
      }
      if (this.selectedTween) {
        this.selectedTween.stop();
        this.selectedTween = null;
      }
    }
  }
}
