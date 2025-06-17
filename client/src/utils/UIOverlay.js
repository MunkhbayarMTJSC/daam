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
      .image(x, y, 'homeBtn')
      .setInteractive()
      .setOrigin(0.5)
      .on('pointerdown', () => {
        this.scene.scene.start('MainLobby');
      });
    this.container.add(btn);
    return btn;
  }

  createCoinsDisplay(x, y, coins) {
    this.coinBorder = this.add
      .image(x, y, 'coins')
      .setScale(0.55)
      .setOrigin(0.5);

    this.coinsText = this.add.text(x, y, coins, {
      fontSize: '14px',
      fill: '#fff',
    });
    this.container.add(this.coinBorder);
    this.container.add(this.coinsText);
  }

  createGemsDisplay() {
    this.gemsText = this.scene.add.text(200, 30, '💎 0', {
      fontSize: '20px',
      fill: '#fff',
    });
    this.container.add(this.gemsText);
  }

  updateCoins(value) {
    this.coinsText.setText('💰 ' + value);
  }

  updateGems(value) {
    this.gemsText.setText('💎 ' + value);
  }

  destroy() {
    this.container.destroy();
  }
}
