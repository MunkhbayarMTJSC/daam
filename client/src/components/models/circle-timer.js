import Phaser from 'phaser';

export default class CircularTimer extends Phaser.GameObjects.Container {
  constructor(scene, x, y, radius = 50, duration = 5000, onComplete = null) {
    super(scene, x, y);

    this.radius = radius;
    this.duration = duration;
    this.onComplete = onComplete;
    this.remainingTime = duration;
    this.running = false;

    // Graphics
    this.fillGraphics = scene.add.graphics();
    this.fillGraphics.setBlendMode(Phaser.BlendModes.NORMAL);
    this.add(this.fillGraphics);

    // Text
    this.text = scene.add
      .text(0, 0, '', {
        fontSize: '18px',
        color: '#000',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);
    this.add(this.text);

    // Таймер эвэнт
    this.timerEvent = scene.time.addEvent({
      delay: 50,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
      paused: true,
    });

    this.scene.add.existing(this);
  }

  updateTimer() {
    if (!this.running) return;

    this.remainingTime -= 50;
    const progress = Phaser.Math.Clamp(
      1 - this.remainingTime / this.duration,
      0,
      1
    );
    const angle = 360 * progress;

    // 1. clear өмнөх зургууд
    this.fillGraphics.clear();

    // 2. ✨ тунгалаг өнгөөр бүтэн дугуй зурна (дунд хэсгийг илэрхийлнэ)
    this.fillGraphics.fillStyle(0x304cc8, 0.001); // 25% opacity
    this.fillGraphics.slice(
      0,
      0,
      this.radius,
      Phaser.Math.DegToRad(0),
      Phaser.Math.DegToRad(360),
      false
    );
    this.fillGraphics.fillPath();

    // 3. ⏳ үлдсэн хугацааг тод өнгөөр давхар зурна
    this.fillGraphics.fillStyle(0x304cc8, 1); // 100% opacity
    this.fillGraphics.slice(
      0,
      0,
      this.radius,
      Phaser.Math.DegToRad(270),
      Phaser.Math.DegToRad(270 + angle),
      false
    );
    this.fillGraphics.fillPath();

    // 4. update text
    const secondsLeft = Math.ceil(this.remainingTime / 1000);
    this.text.setText(`${secondsLeft}`);

    if (this.remainingTime <= 0) {
      this.running = false;
      this.timerEvent.paused = true;
      if (typeof this.onComplete === 'function') {
        this.onComplete();
      }
    }
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

  reset() {
    this.remainingTime = this.duration;
    this.running = true;
    this.timerEvent.paused = false;
  }

  stop() {
    this.running = false;
    this.timerEvent.remove(false);
  }
}
