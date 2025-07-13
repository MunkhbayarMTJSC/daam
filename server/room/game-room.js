import GameLogic from '../logic/game-logic.js';
import BotManager from './bot-manager.js';
import GameState from './game-state.js';
import MoveHanlder from './move-handler.js';
import PlayerManager from './player-manager.js';
import TimerManager from './time-manager.js';

export default class GameRoom {
  constructor(roomCode, io, vsBot) {
    this.roomCode = roomCode;
    this.io = io;
    this.vsBot = vsBot;
    this.pm = new PlayerManager(this.roomCode, this.io);
    this.tm = new TimerManager(this);
    this.gs = new GameState(this.roomCode, this.pm.players, this.vsBot);
    this.gl = new GameLogic(this.gs.board, (winner) => {
      this.endGame(winner);
    });
    this.mh = new MoveHanlder(this.gl, this.gs, this.tm);
    this.bm = new BotManager(this.gl, this.mh, this.gs, this.io, this.roomCode);
  }
  startGame() {
    this.gl.startGame();
    this.gs.gameStartedAt = Date.now();
    this.tm.startPlayerClock(this.gs.currentTurn);
    if (this.bm.isBotTurn()) {
      setTimeout(() => {
        this.bm.makeMove();
      }, 1000);
    }
  }
  endGame(winner) {
    this.gs.winner = winner;
    this.gs.gameEndedAt = Date.now();
    const duration = Date.now() - this.gs.gameStartedAt;
    this.tm.clearAll();
    const formattedDuration = this.gs.formatDuration(duration);
    this.io.to(this.roomCode).emit('gameEnded', {
      winner,
      formatetDuration: formattedDuration,
      moveCount: this.gs.moveHistory.length,
      playerColors: this.pm.playerColors,
      roomCode: this.roomCode,
      vsBot: this.vsBot,
      players: this.pm.players,
    });
  }

  resetForReplay() {
    this.gl.resetGame(); // GameLogic дотор байгаа reset
    this.gs.resetGame(); // GameState (moveHistory, winner г.м.)
    this.pm.resetReady(); // Ready статус цэвэрлэх
  }

  getSaveData() {
    return {
      colors: this.pm.playerColors,
      currentTurn: this.gs.currentTurn,
      pieces: this.gl.pieceManager.serialize(),
      movablePieces: this.gl.currentMovablePieces,
      moveHistory: this.gs.moveHistory,
      winner: this.gs.winner,
      gameStartedAt: this.gs.gameStartedAt,
      board: this.gs.board.serialize(),
      vsBot: this.vsBot,
      botColor: this.gs.botColor,
    };
  }

  loadFromData(data) {
    this.gs.roomCode = data.roomCode;
    this.pm.players = data.players.map((p) => ({
      ...p,
      socketId: null,
    }));

    this.pm.playerColors = data.playerColors;
    this.gs.currentTurn = data.currentTurn;
    this.gs.moveHistory = data.moveHistory;
    this.gs.winner = data.winner;
    this.gs.gameStartedAt = data.gameStartedAt;
    this.gs.gameEndedAt = data.gameEndedAt;

    this.gs.board = new Board();
    this.gs.board.deserialize(data.board);
    this.tm.clearAll();
    this.gl = new GameLogic(this.gs.board, (winner) => {
      this.gs.winner = winner;
      this.gs.gameEndedAt = Date.now();
      const duration = Date.now() - this.gs.gameStartedAt;
      const formattedDuration = this.gs.formatDuration(duration);
      this.io.to(this.roomCode).emit('gameEnded', {
        winner,
        formatetDuration: formattedDuration,
        moveCount: this.gs.moveHistory.length,
        playerColors: this.pm.playerColors,
        roomCode: this.roomCode,
        vsBot: this.vsBot,
        players: this.pm.players,
      });
    });

    this.gl.pieceManager.deserialize(data.pieces);
  }
}
