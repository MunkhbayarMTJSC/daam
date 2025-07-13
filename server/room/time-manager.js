export default class TimerManager {
  constructor(room, options = {}) {
    this.room = room;

    this.playerTimes = {
      0: options.playerTimeMs || 60 * 60 * 1000, // 30 мин
      1: options.playerTimeMs || 60 * 60 * 1000,
    };

    this.inactiveTimeoutMs = options.inactiveTimeoutMs || 5 * 60 * 1000;

    this.activeColor = null; // аль тоглогчийн цаг явж байгаа вэ
    this.lastMoveAt = null; // сүүлийн нүүдлийн timestamp
    this.playerTimer = null; // тоглогчийн цаг (setTimeout)
    this.inactiveTimer = null; // 5 мин inactivity timer
  }

  /** Нэг тоглогчийн цагийг эхлүүлэх */
  startPlayerClock(color) {
    this.clearAllTimers();

    this.activeColor = color;
    this.lastMoveAt = Date.now();

    // ⏱ Inactivity timer
    this.inactiveTimer = setTimeout(() => {
      this.handleInactiveTimeout(color);
    }, this.inactiveTimeoutMs);

    // 🕐 Player total time countdown
    this.playerTimer = setTimeout(() => {
      this.handlePlayerTimeout(color);
    }, this.playerTimes[color]);
  }

  /** Нүүсний дараа хугацаа хасах */
  updateTimeAfterMove(prevColor) {
    const now = Date.now();
    const elapsed = now - this.lastMoveAt;
    this.playerTimes[prevColor] -= elapsed;

    if (this.playerTimes[prevColor] <= 0) {
      this.handlePlayerTimeout(prevColor);
    }
  }

  /** 5 мин нүүгээгүй үед дуусгах */
  handleInactiveTimeout(color) {
    const loser = this.room.pm.getPlayerByColor(color);
    const socket = this.room.pm.getSocketByPlayer(loser);
    const winner = 1 - color;

    if (socket) {
      socket.emit('turnTimeout', '⏰ Та 5 мин нүүхгүй байснаар ялагдлаа.');
    }

    this.room.endGame(winner);
  }

  /** Тоглогчийн нийт цаг дууссан үед */
  handlePlayerTimeout(color) {
    const winner = 1 - color;
    this.room.endGame(winner);
  }

  clearAllTimers() {
    if (this.playerTimer) clearTimeout(this.playerTimer);
    if (this.inactiveTimer) clearTimeout(this.inactiveTimer);
    this.playerTimer = null;
    this.inactiveTimer = null;
  }

  /** Тоглоом дуусахад */
  clearAll() {
    this.clearAllTimers();
  }
}
