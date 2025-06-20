import GameConfig from '../utils/GameConfig.js';
import * as CONFIG from '../Config.js';
export default class BoardView {
  #scene;
  #tiles;
  #tileSize;
  #boardSize;
  #playerColor;
  #offSetX;
  #offSetY;
  #centerX;
  #centerY;
  constructor(scene, boardSize = 10) {
    this.#scene = scene;
    this.#tiles = [];
    this.#tileSize = CONFIG.TILE_SIZE;
    this.#boardSize = boardSize;
  }

  setPlayerColor(playerColor) {
    this.#playerColor = playerColor; // 0 = хар, 1 = улаан
  }

  draw(width, height) {
    this.#offSetX = CONFIG.BOARD_OFFSET_X;
    this.#offSetY = CONFIG.BOARD_OFFSET_Y;
    this.#centerX = this.#scene.cameras.main.width / 2;
    this.#centerY = this.#scene.cameras.main.height / 2;
    this.boardImage = this.#scene.add
      .image(width / 2, height / 2, 'board')
      .setDisplaySize(width, height);
  }
  getTransformedRow(row) {
    return this.#playerColor === 0 ? 9 - row : row;
  }
  getTransformedCol(col) {
    return this.#playerColor === 0 ? 9 - col : col;
  }

  getTilePosition(row, col) {
    const transformedRow = this.getTransformedRow(row);
    const transformedCol = this.getTransformedCol(col);
    const x =
      transformedCol * this.#tileSize + this.#tileSize / 2 + this.#offSetX;
    const y =
      transformedRow * this.#tileSize + this.#tileSize / 2 + this.#offSetY;
    return { x, y };
  }
}
