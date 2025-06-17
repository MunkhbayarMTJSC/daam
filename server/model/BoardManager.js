export default class BoardManager {
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
        this.tiles[row][col] = {
          row,
          col,
          isDark,
          type: isDark ? 'dark' : 'light',
          occupiedBy: null,
        };
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
  serialize() {
    return this.tiles.map((row) =>
      row.map((tile) => ({
        row: tile.row,
        col: tile.col,
        isDark: tile.isDark,
        type: tile.type,
        occupiedBy: tile.occupiedBy,
      }))
    );
  }
  deserialize(data) {
    this.tiles = data.map((row) =>
      row.map((tile) => ({
        row: tile.row,
        col: tile.col,
        isDark: tile.isDark,
        type: tile.type,
        occupiedBy: tile.occupiedBy,
      }))
    );
  }
}
