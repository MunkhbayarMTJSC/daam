export default class Piece extends Phaser.GameObjects.Container {
  #scene;
  #row;
  #col;
  #id;
  #color;
  #isKing;
  #sprite;
  #board;
  constructor(scene, board, row, col, data) {
    const { x, y } = board.getTilePosition(row, col);
    super(scene, x, y);
    this.#scene = scene;
    this.#board = board;
    this.#row = row;
    this.#col = col;
    this.#id = data.id;
    this.#color = data.color;
    this.#isKing = data.isKing;
    const frame = this.getFrame();
    this.#sprite = scene.add.sprite(0, 0, 'pieces', frame).setScale(0.42);
    this.add(this.#sprite);
    this.setSize(this.#sprite.displayWidth, this.#sprite.displayHeight);
    this.setInteractive();
    scene.add.existing(this);
  }
  get row() {
    return this.#row;
  }
  get col() {
    return this.#col;
  }

  updatePieceState({ row, col, isKing }) {
    this.#isKing = isKing;

    this.#row = row;
    this.#col = col;

    const frame = this.getFrame();
    this.#sprite.setFrame(frame);
  }
  getFrame() {
    return this.#color === 0 ? (this.#isKing ? 2 : 3) : this.#isKing ? 0 : 1;
  }

  destroyPiece() {
    this.destroy();
  }
  moveTo(row, col) {
    const { x, y } = this.#board.getTilePosition(row, col);
    this.setPosition(x, y);
    this.#row = row;
    this.#col = col;
  }
}
