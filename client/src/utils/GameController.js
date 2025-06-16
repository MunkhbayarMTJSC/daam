export default class GameController {
  constructor(scene, board, pieceManager, playerColor, showHighlighter) {
    this.scene = scene;
    this.board = board;
    this.activeHighlights = [];
    this.pieceManager = pieceManager;
    this.playerColor = playerColor;
    this.showHighlighter = showHighlighter;
    this.scene.socket.off('highlightMoves');
    this.scene.socket.on('highlightMoves', ({ piece, moves }) => {
      this.showHighlightMoves(piece, moves);
    });
    this.scene.socket.on('clearHighlightMovePath', () => {
      this.showHighlighter.clearMovePathHighlight();
    });
    this.scene.socket.on('highlightMovePath', (data) => {
      this.showHighlighter.highlightMovePath(data.moveChain, data.piece);
      this.animateMove(data.piece, data.moveChain);
    });
  }
  showMovablePieces(piecesArray, currentTurn, movablePieces) {
    // 🧹 Эхлээд бүх sprite-үүдийн interactive-г устгах
    for (const sprite of this.pieceManager.pieces.values()) {
      sprite.disableInteractive();
      sprite.removeAllListeners(); // 🎯 pointerdown-ууд давхардахаас сэргийлнэ
    }

    this.pieceManager.updatePieces(piecesArray);

    const movablePieceIds = new Set(
      Array.isArray(movablePieces) ? movablePieces.map((p) => p.id) : []
    );

    for (const piece of movablePieces) {
      const sprite = this.pieceManager.getPieceSpriteAt(piece.id);
      if (!sprite) continue;

      const isMyTurn = currentTurn === this.playerColor;
      const isMyPiece = piece.color === this.playerColor;
      const isMovable = movablePieceIds.has(piece.id);

      if (isMyTurn && isMyPiece && isMovable) {
        sprite.setInteractive();
        sprite.on('pointerdown', () => {
          this.scene.socket.emit('selectedPiece', {
            roomCode: this.scene.roomCode,
            pieceId: piece.id,
          });
          this.showHighlighter.highlightSelectedPiece(sprite);
        });
        this.showHighlighter.highlightMovablePieces(movablePieces || []);
      }
    }
  }

  showHighlightMoves(piece, moves) {
    const moveHigligths = this.showHighlighter.highlightMoves(moves);
    for (const { square, chain } of moveHigligths) {
      square
        .setInteractive()
        .on('pointerdown', () => this.sendMove(piece, chain));
    }
  }
  animateMove(piece, chain, onComplete) {
    const sprite = this.pieceManager.getPieceSpriteAt(piece.id);
    if (!sprite || chain.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    const moveStep = (index) => {
      if (index >= chain.length) {
        if (onComplete) onComplete();
        return;
      }

      const step = chain[index];
      const { row, col, captured } = step;

      const { x, y } = this.board.getTilePosition(row, col);

      // 🔫 Fade out captured pieces
      if (captured) {
        const capturedArray = Array.isArray(captured) ? captured : [captured];
        for (const cap of capturedArray) {
          const capturedSprite = this.pieceManager.getPieceSpriteAt(cap.id);
          if (capturedSprite) {
            this.scene.tweens.add({
              targets: capturedSprite,
              alpha: 0,
              duration: 200,
              onComplete: () => capturedSprite.destroy(),
            });
          }
        }
      }

      // 🎬 Animate this step
      this.scene.tweens.add({
        targets: sprite,
        x,
        y,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          moveStep(index + 1);
        },
      });
    };

    moveStep(0);
  }

  sendMove(piece, chain) {
    this.showHighlighter.highlightMovePath(chain, piece);
    this.showHighlighter.clearHighlights();
    this.scene.socket.emit('playerMove', {
      roomCode: this.scene.roomCode,
      piece: {
        id: piece.id,
        row: piece.row,
        col: piece.col,
      },
      moveChain: chain.map(({ row, col, captured }) => ({
        row,
        col,
        captured: Array.isArray(captured)
          ? captured.map((c) => ({
              id: c.id,
              row: c.row,
              col: c.col,
            }))
          : captured
          ? [
              {
                id: captured.id,
                row: captured.row,
                col: captured.col,
              },
            ]
          : [],
      })),
    });

    this.showHighlighter.clearMovePathHighlight();
  }
}
