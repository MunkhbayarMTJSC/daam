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
    this.#sprite = scene.add.sprite(0, 0, 'pieces', frame).setScale(0.45);
    this.add(this.#sprite);
    this.setSize(this.#sprite.width, this.#sprite.height);
    this.setInteractive();
    scene.add.existing(this);
  }
  get row() {
    return this.#row;
  }
  get col() {
    return this.#col;
  }

  getFrame() {
    return this.#color === 0 ? (this.isKing ? 2 : 3) : this.isKing ? 0 : 1;
  }
  updatePieceState({ row, col, isKing }) {
    this.#isKing = isKing;

    // ❌ Тухайн үед tween хийгдэж байгаа байж магадгүй тул setPosition хийж болохгүй
    this.#row = row;
    this.#col = col;

    this.#sprite.setFrame(this.getFrame());
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
