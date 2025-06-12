import { PieceManager } from '../model/PieceManager.js';
import { MoveCalculator } from './MoveCalculator.js';
import { GameRules } from './GameRules.js';

export default class GameLogic {
  constructor(board, onGameOver) {
    this.board = board;
    this.onGameOver = onGameOver;

    this.pieceManager = new PieceManager(board);
    this.moveCalculator = new MoveCalculator(board, this.pieceManager);
    this.rules = new GameRules(this.pieceManager, this.moveCalculator);

    this.selectedPiece = null;
    this.validMoves = [];
    this.currentMovablePieces = [];
  }

  startGame() {
    this.pieceManager.createInitialPieces();
    this.updateMovablePieces(1);
  }
  moveSimple(piece, move) {
    piece.row = move.row;
    piece.col = move.col;
    this.pieceManager.promoteIfNeeded(piece);

    this.selectedPiece = null;
    this.validMoves = [];
    return false; // always end turn
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
      return true; // chaining continues
    }

    this.selectedPiece = null;
    this.validMoves = [];
    return false; // turn ends
  }

  updateMovablePieces(color) {
    this.currentMovablePieces = this.moveCalculator.getMovablePieces(color);
    return this.currentMovablePieces;
  }

  checkGameOver(color) {
    return this.rules.isGameOver(color);
  }
}
