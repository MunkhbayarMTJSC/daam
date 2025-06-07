export default class UIOverlay {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.createHomeBtn();
    this.createCoinsDisplay();
    this.createGemsDisplay();
  }
  createHomeBtn(x, y) {
    const btn = this.scene.add
      .image(x, y, "homeBtn")
      .setInteractive()
      .setOrigin(0.5)
      .on("pointerdown", () => {
        this.scene.scene.start("MainScene");
      });
    this.container.add(btn);
    return btn;
  }

  createCoinsDisplay() {
    this.coinsText = this.scene.add.text(100, 30, "💰 0", {
      fontSize: "20px",
      fill: "#fff",
    });
    this.container.add(this.coinsText);
  }

  createGemsDisplay() {
    this.gemsText = this.scene.add.text(200, 30, "💎 0", {
      fontSize: "20px",
      fill: "#fff",
    });
    this.container.add(this.gemsText);
  }

  updateCoins(value) {
    this.coinsText.setText("💰 " + value);
  }

  updateGems(value) {
    this.gemsText.setText("💎 " + value);
  }

  destroy() {
    this.container.destroy();
  }
}
