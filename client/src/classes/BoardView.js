import GameConfig from '../utils/GameConfig.js';
export default class BoardView {
  constructor(scene, tileSize = 40, boardSize = 10) {
    this.scene = scene;
    this.tiles = [];
    this.tileSize = tileSize;
    this.boardSize = boardSize;
  }

  setPlayerColor(playerColor) {
    this.playerColor = playerColor; // 0 = хар, 1 = улаан
  }

  draw(width, height) {
    console.log(this.tileSize);
    const { offsetX, offsetY, centerX, centerY } = GameConfig.getBoardOffsets(
      this.scene
    );
    this.offSetX = offsetX;
    this.offSetY = offsetY;
    this.centerX = centerX;
    this.centerY = centerY;
    this.boardImage = this.scene.add
      .image(width / 2, height / 2, 'board')
      .setDisplaySize(width, height);
  }
  getTransformedRow(row) {
    return this.playerColor === 0 ? 9 - row : row;
  }
  getTransformedCol(col) {
    return this.playerColor === 0 ? 9 - col : col;
  }

  getTilePosition(row, col) {
    const transformedRow = this.getTransformedRow(row);
    const transformedCol = this.getTransformedCol(col);
    const x = transformedCol * this.tileSize + this.tileSize / 2 + this.offSetX;
    const y = transformedRow * this.tileSize + this.tileSize / 2 + this.offSetY;
    return { x, y };
  }
}
