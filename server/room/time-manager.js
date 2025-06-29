// timer-manager.js
export default class TimerManager {
  constructor(room, options = {}) {
    this.room = room;
    this.turnTimeoutMs = options.turnTimeoutMs || 5 * 60 * 1000; // 5 минут
    this.gameDurationMs = options.gameDurationMs || 60 * 60 * 1000; // 1 цаг

    this.turnTimer = null;
    this.gameTimer = null;
  }

  startTurnTimer(currentPlayer) {
    this.clearTurnTimer();
    this.turnTimer = setTimeout(() => {
      this.handleTurnTimeout(currentPlayer);
    }, this.turnTimeoutMs);
  }

  clearTurnTimer() {
    if (this.turnTimer) clearTimeout(this.turnTimer);
    this.turnTimer = null;
  }

  handleTurnTimeout(player) {
    const socket = this.room.pm.getSocketByPlayer(player);
    if (socket) {
      socket.emit('turnTimeout', '⏰ Цаг дууссан тул та хожигдлоо');
    }
    this.room.endGameDueToTimeout(player);
  }

  startGameTimer() {
    this.gameTimer = setTimeout(() => {
      this.handleGameTimeOver();
    }, this.gameDurationMs);
  }

  handleGameTimeOver() {
    const winner = this.room.gl.getPlayerWithMostPieces();
    this.room.forceEndGame(winner, '⏱ Тоглолтын цаг дууссан');
  }

  clearAll() {
    this.clearTurnTimer();
    if (this.gameTimer) clearTimeout(this.gameTimer);
    this.gameTimer = null;
  }
}
