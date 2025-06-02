import GameConfig from '../utils/GameConfig.js'
export default class BoardView {
    constructor(scene,tileSize=48, boardSize=10) {
        this.scene = scene;
        this.tiles = [];
        this.tileSize = tileSize;
        this.boardSize = boardSize;
    }
    draw() {
        const { offsetX, offsetY, centerX, centerY } = GameConfig.getBoardOffsets(this.scene);
        this.offSetX = offsetX;
        this.offSetY = offsetY;
        this.centerX = centerX;
        this.centerY = centerY;
        this.boardImage = this.scene.add.image(centerX, centerY, 'board');
    }
    getTilePosition(row, col) {
        const x = col * this.tileSize + this.tileSize / 2 + this.offSetX;
        const y = row * this.tileSize + this.tileSize / 2 + this.offSetY;
        return { x, y };
    }
}