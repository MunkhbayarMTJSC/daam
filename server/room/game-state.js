import BoardManager from '../game/board-manager.js';

export default class GameState {
  constructor(roomCode, players, gameLogic, vsBot) {
    this.roomCode = roomCode;
    this.board = new BoardManager();
    this.currentTurn = 1;
    this.moveHistory = [];
    this.winner = null;
    this.gameStartedAt = Date.now();
    this.players = players;
    this.botColor = 1;
    this.gameLogic = gameLogic;
    this.gameEndedAt = null;
    this.vsBot = vsBot;
  }
  resetGame() {
    this.board = new BoardManager();
    this.currentTurn = 1;
    this.moveHistory = [];
    this.winner = null;
    this.startTime = Date.now();
    this.players.forEach((p) => {
      p.ready = false;
    });
  }
  formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} мин ${seconds} сек`;
  }
  isPlayerTurn(socketId) {
    if (this.vsBot && socketId === 'bot') {
      return this.currentTurn === this.botColor;
    }
    const currentPlayer = this.players[this.currentTurn];
    return currentPlayer.socketId === socketId;
  }
}
