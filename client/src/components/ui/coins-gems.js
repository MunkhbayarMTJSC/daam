export class Coins {
  #scene;
  #coins;
  #coinText;
  #coords;
  #coinContainer;
  constructor(scene, coins, coords) {
    this.scene = scene;
    this.#coins = coins;
    this.#coords = coords;
    this.#coinContainer = scene.add.container(coords.x, coords.y);
    const coinsImg = scene.add.image(0, 0, 'coins').setScale(0.55);
    this.#coinText = scene.add
      .text(24, 0, this.formatNumberShort(this.#coins))
      .setOrigin(1, 0.5);
    this.#coinContainer.add([this.#coinText, coinsImg]);
  }
  setCoins(coins) {
    this.#coins = coins;
    this.#coinText.setText(formatNumberShort(coins.toString()));
  }
  setPosition(x, y) {
    this.#coinContainer.setPosition(x, y);
  }

  destroy() {
    this.#coinContainer.destroy();
  }
  getContainer() {
    return this.#coinContainer;
  }
  formatNumberShort(num) {
    if (num >= 1_000_000)
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
  }
}

export class Gems {
  #scene;
  #gems;
  #gemsText;
  #coords;
  #gemsContainer;
  constructor(scene, gems, coords) {
    this.scene = scene;
    this.#gems = gems;
    this.#coords = coords;
    this.#gemsContainer = scene.add.container(coords.x, coords.y);
    const gemsImg = scene.add.image(0, 0, 'gems').setScale(0.55);
    this.#gemsText = scene.add
      .text(24, 0, this.formatNumberShort(this.#gems))
      .setOrigin(1, 0.5);
    this.#gemsContainer.add([this.#gemsText, gemsImg]);
  }
  setGems(gems) {
    this.#gems = gems;
    this.#gemsText.setText(formatNumberShort(gems.toString()));
  }
  setPosition(x, y) {
    this.#gemsContainer.setPosition(x, y);
  }

  destroy() {
    this.#gemsContainer.destroy();
  }
  getContainer() {
    return this.#gemsContainer;
  }
  formatNumberShort(num) {
    if (num >= 1_000_000)
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
  }
}
