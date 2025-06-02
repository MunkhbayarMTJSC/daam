export default class Board {
    constructor() {
      this.tiles = [];
      this.generateBoard();
    }
  
    generateBoard() {
      for (let row = 0; row < 10; row++) {
        this.tiles[row] = [];
        for (let col = 0; col < 10; col++) {
          const isDark = (row + col) % 2 === 1;
          this.tiles[row][col] = { row, col, isDark };
        }
      }
    }
  
    isValidTile(row, col) {
      return (
        row >= 0 &&
        row < 10 &&
        col >= 0 &&
        col < 10 &&
        this.tiles[row][col] &&
        this.tiles[row][col].isDark
      );
    }
  }
  