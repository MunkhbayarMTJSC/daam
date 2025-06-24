export class GameTimer {
  constructor(
    scene,
    x,
    y,
    width = 200,
    height = 5,
    duration = 180000,
    onComplete
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.duration = duration;
    this.onComplete = onComplete;

    this.remainingTime = duration;
    this.running = false;

    // Background
    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x444444);
    this.bg.fillRect(x, y, width, height);

    // Fill bar
    this.bar = scene.add.graphics();
    this.bar.fillStyle(0x00ff00);

    // Timer event
    this.timerEvent = scene.time.addEvent({
      delay: 50,
      callback: this.update,
      callbackScope: this,
      loop: true,
      paused: true,
    });
  }

  start() {
    this.remainingTime = this.duration;
    this.running = true;
    this.timerEvent.paused = false;
  }

  pause() {
    this.running = false;
    this.timerEvent.paused = true;
  }
  unpause() {
    if (!this.running && this.remainingTime > 0) {
      this.running = true;
      this.timerEvent.paused = false;
    }
  }

  reset() {
    this.remainingTime = this.duration;
    this.running = true;
    this.timerEvent.paused = false;
  }

  stop() {
    this.pause();
    this.bar.clear();
    this.text.setText('');
  }

  update() {
    if (!this.running) return;

    this.remainingTime -= 50;
    const progress = Phaser.Math.Clamp(
      this.remainingTime / this.duration,
      0,
      1
    );

    // Draw fill
    this.bar.clear();
    this.bar.fillStyle(0x00ff00);
    this.bar.fillRect(this.x, this.y, this.width * progress, this.height);

    if (this.remainingTime <= 0) {
      this.stop();
      if (typeof this.onComplete === 'function') {
        this.onComplete();
      }
    }
  }
}
