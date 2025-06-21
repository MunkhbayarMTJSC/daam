import { Scale } from 'phaser';

export default class ShowHighlighter {
  constructor(scene, board, pieceManager, playerColor) {
    this.scene = scene;
    this.board = board;
    this.activeHighlights = [];
    this.pieceManager = pieceManager;
    this.playerColor = playerColor;
    this.glowHighlights = [];
    this.validMoveCircles = [];
    this.selectedGlow = null;
    this.selectedTween = null;
    this._movePathGraphics = null;
  }
  highlightMovablePieces(movablePieces) {
    this.clearHighlights({ keepSelected: false });
    for (const piece of movablePieces) {
      const pieceObj = this.pieceManager.getPieceById(piece.id);

      if (pieceObj) {
        pieceObj.setDepth(10);

        const glow = this.scene.add.graphics();
        glow.fillStyle(0x197745, 1);
        glow.fillRect(pieceObj.x - 20, pieceObj.y - 20, 40, 40);
        glow.setDepth(9);
        this.glowHighlights.push(glow);
      }
    }
  }

  highlightSelectedPiece(piece) {
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
    glow.fillRect(piece.x - 20, piece.y - 20, 40, 40);
    glow.setDepth(8);

    this.selectedGlow = glow;
  }

  highlightMoves(moveChains) {
    this.clearHighlights({ keepSelected: true });
    for (const chain of moveChains) {
      for (let i = 0; i < chain.length; i++) {
        const step = chain[i];
        const { row, col } = step;
        const { x, y } = this.board.getTilePosition(row, col);
        const color = i === chain.length - 1 ? 0xa5d674 : 0x68c0dd;
        const alpha = i === chain.length - 1 ? 0.9 : 0.5;
        const square = this.scene.add
          .rectangle(x, y, 40, 40, color, alpha)
          .setDepth(10);

        this.validMoveCircles.push({ square, chain });
      }
    }
    return this.validMoveCircles;
  }

  // 0: captured:
  //   Array(1)
  //   0: {id: '1-5-6-1750488842904-0.6643049859071635', row: 5, col: 4}
  //   length: 1
  // [[Prototype]]:
  // Array(0)
  // col: 3
  // row: 6
  // [[Prototype]]: Object
  // 1: captured:
  //   Array(1)
  //   0: {id: '1-3-6-1750488842904-0.732874931008646', row: 5, col: 2}
  //   length: 1
  // [[Prototype]]:
  // Array(0)
  // col: 1 Идээд буусан
  // row: 4 Идээд буусан
  // [[Prototype]]: Object
  // length: 2
  highlightMovePath(piece, moveChain) {
    if (!Array.isArray(moveChain) || moveChain.length === 0) return;
    const graphics = this.scene.add.graphics();
    this._movePathGraphics = graphics;
    graphics.lineStyle(1, 0xffd700, 1); // Алтан хүрээ
    graphics.setDepth(7);

    const boxSize = this.board.tileSize * 0.8;
    const halfBox = boxSize / 2;

    // 1. Эхлэл цэг
    const startPos = this.board.getTilePosition(piece.row, piece.col);
    graphics.strokeRect(
      startPos.x - halfBox,
      startPos.y - halfBox,
      boxSize,
      boxSize
    );

    // 2. Дамжсан нүд бүр
    for (const move of moveChain) {
      const movePos = this.board.getTilePosition(move.row, move.col);
      graphics.strokeRect(
        movePos.x - halfBox,
        movePos.y - halfBox,
        boxSize,
        boxSize
      );

      // 3. Хэрэв capture хийсэн бол тэр нүднүүдийг ч бас зурна
      const capturedArray = Array.isArray(move.captured)
        ? move.captured
        : move.captured
        ? [move.captured]
        : [];

      for (const cap of capturedArray) {
        const capPos = this.board.getTilePosition(cap.row, cap.col);
        graphics.strokeRect(
          capPos.x - halfBox,
          capPos.y - halfBox,
          boxSize,
          boxSize
        );
      }
    }
  }

  clearMovePathHighlight() {
    if (this._movePathGraphics) {
      this._movePathGraphics.destroy();
      this._movePathGraphics = null;
    }
  }

  clearHighlights({ keepSelected = false } = {}) {
    this.validMoveCircles.forEach(({ square }) => square.destroy());

    this.validMoveCircles = [];

    this.glowHighlights.forEach((g) => g.destroy());
    this.glowHighlights = [];

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
