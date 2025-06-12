export default class Board {
  constructor(size = 10) {
    this.tiles = [];
    this.size = size;
    this.generateBoard();
  }

  generateBoard() {
    for (let row = 0; row < this.size; row++) {
      this.tiles[row] = [];
      for (let col = 0; col < this.size; col++) {
        const isDark = (row + col) % 2 === 1;
        this.tiles[row][col] = { row, col, isDark };
      }
    }
  }

  isValidTile(row, col) {
    return (
      row >= 0 &&
      row < this.size &&
      col >= 0 &&
      col < this.size &&
      this.tiles[row][col] &&
      this.tiles[row][col].isDark
    );
  }
  getTile(row, col) {
    if (this.isValidTile(row, col)) {
      return this.tiles[row][col];
    }
    return null;
  }
  isEdge(row, color) {
    return (color === 0 && row === this.size - 1) || (color === 1 && row === 0);
  }
}
