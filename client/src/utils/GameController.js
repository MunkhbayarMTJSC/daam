export default class GameController {
  constructor(
    scene,
    board,
    pieceManager,
    playerColor,
    showHighlighter,
    socket
  ) {
    this.scene = scene;
    this.board = board;
    this.activeHighlights = [];
    this.pieceManager = pieceManager;
    this.moveHistory = [];
    this.playerColor = playerColor;
    this.showHighlighter = showHighlighter;
    socket.off('highlightMoves');
    socket.on('highlightMoves', ({ piece, moves }) => {
      this.showHighlightMoves(piece, moves);
    });
    socket.on('clearHighlightMovePath', () => {
      this.showHighlighter.clearMovePathHighlight();
    });
    socket.on('highlightMovePath', (data) => {
      this.showHighlighter.highlightMovePath(data.piece, data.moveChain);
      this.animateMove(data.piece, data.moveChain);
    });
  }
  showMovablePieces(piecesArray, currentTurn, movablePieces) {
    // 🧹 Эхлээд бүх sprite-үүдийн interactive-г устгах
    for (const sprite of this.pieceManager.pieces.values()) {
      sprite.disableInteractive();
      sprite.removeAllListeners(); // pointerdown-ууд давхардахаас сэргийлнэ
    }

    this.pieceManager.updatePieces(piecesArray);

    const movablePieceIds = new Set(
      Array.isArray(movablePieces) ? movablePieces.map((p) => p.id) : []
    );

    const isMyTurn = currentTurn === this.playerColor;
    const filteredMovablePieces = movablePieces.filter(
      (p) =>
        p.color === this.playerColor && isMyTurn && movablePieceIds.has(p.id)
    );

    for (const piece of filteredMovablePieces) {
      const sprite = this.pieceManager.getPieceSpriteAt(piece.id);
      if (!sprite) continue;

      const isMyPiece = piece.color === this.playerColor;
      const isMovable = movablePieceIds.has(piece.id);

      // Зөвхөн өөрийн ээлж, өөрийн хүү дээр интерактив идэвхжүүлнэ
      if (isMyTurn && isMyPiece && isMovable) {
        sprite.setInteractive();
        sprite.on('pointerdown', () => {
          this.scene.socket.emit('selectedPiece', {
            roomCode: this.scene.roomCode,
            pieceId: piece.id,
          });
          this.showHighlighter.highlightSelectedPiece(sprite);
        });
      }
    }

    // Энд бүх нүүдэл хийх боломжтой хүүд зориулан нэг удаа харуулах
    this.showHighlighter.highlightMovablePieces(filteredMovablePieces || []);
  }

  showHighlightMoves(piece, moves) {
    const moveHigligths = this.showHighlighter.highlightMoves(moves);
    for (const { square, chain } of moveHigligths) {
      square
        .setInteractive()
        .on('pointerdown', () => this.sendMove(piece, chain));
    }
  }

  setCurrentTurn(turn) {
    this.currentTurn = turn;
  }

  animateMove(pieceData, chain, onComplete) {
    const pieceObject = this.pieceManager.getPieceById(pieceData.id);

    if (!pieceObject || chain.length === 0) {
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
          const capSprite = this.pieceManager.getPieceById(cap.id);
          if (capSprite) {
            this.scene.tweens.add({
              targets: capSprite,
              alpha: 0,
              duration: 200,
              onComplete: () => capSprite.destroyPiece(),
            });
          }
        }
      }

      // 🎬 Animate this step
      this.scene.tweens.add({
        targets: pieceObject,
        x,
        y,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          pieceObject.moveTo(row, col);
          moveStep(index + 1);
        },
      });
    };

    moveStep(0);
  }

  setMoveHistory(moveHistory) {
    this.moveHistory = moveHistory || [];
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
