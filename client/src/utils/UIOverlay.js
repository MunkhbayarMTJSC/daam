export default class UIOverlay {
  constructor(scene) {
    this.scene = scene;
    this.container = this.add.container(0, 0);
    this.createHomeBtn();
    this.createCoinsDisplay();
    this.createGemsDisplay();
  }
}
