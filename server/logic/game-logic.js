import { PiecesManager } from '../game/piece-manager.js';
import { MoveCalculator } from './move-calculator.js';
import { GameRules } from './game-rule.js';

export default class GameLogic {
  constructor(board, onGameOver) {
    this.board = board;
    this.onGameOver = onGameOver;

    this.pieceManager = new PiecesManager(board);
    this.moveCalculator = new MoveCalculator(board, this.pieceManager);
    this.rules = new GameRules(this.pieceManager, this.moveCalculator);

    this.resetSelection();
    this.currentMovablePieces = [];
  }
  startGame(startingColor = 1) {
    this.pieceManager.createInitialPieces();
    this.updateMovablePieces(startingColor);
  }
  resetGame(startingColor = 1) {
    this.pieceManager.clearPieces();
    this.pieceManager.createInitialPieces();
    this.resetSelection();
    this.updateMovablePieces(startingColor);
  }
  surrender(currentTurn) {
    const winner = 1 - currentTurn;
    this.onGameOver(winner, { surrendered: true });
  }
  moveSimple(piece, move, currentTurn) {
    piece.row = move.row;
    piece.col = move.col;
    this.pieceManager.promoteIfNeeded(piece);
    this.resetSelection();
    this.checkAndEndTurn(currentTurn);
    return false;
  }
  moveCapture(piece, moveChain, currentTurn) {
    for (const move of moveChain) {
      if (move.captured != null) {
        this.pieceManager.removePiece(move.captured.id);
      }
      piece.row = move.row;
      piece.col = move.col;
    }
    this.pieceManager.promoteIfNeeded(piece);
    const furtherChains = this.moveCalculator.getValidMoves(piece, true);
    const meaningfulChains = furtherChains.filter((chain) =>
      chain.some((step) => step.captured)
    );
    if (meaningfulChains.length > 0) {
      this.selectedPiece = piece;
      this.validMoves = meaningfulChains;
      this.updateMovablePieces(currentTurn);
      return true;
    }

    this.resetSelection();
    this.checkAndEndTurn(currentTurn);
    return false;
  }
  updateMovablePieces(color) {
    this.currentMovablePieces = this.moveCalculator.getMovablePieces(color);
    return this.currentMovablePieces;
  }
  checkGameOver(color) {
    return this.rules.isGameOver(color);
  }
  resetSelection() {
    this.selectedPiece = null;
    this.validMoves = [];
  }
  checkAndEndTurn(currentTurn) {
    if (this.rules.isGameOver(1 - currentTurn)) {
      this.onGameOver(currentTurn);
    }
  }
  getGameState() {
    return {
      board: this.board,
      pieces: this.pieceManager.getAllPieces(),
      currentMovablePieces: this.currentMovablePieces,
      selectedPiece: this.selectedPiece,
      validMoves: this.validMoves,
    };
  }
}
