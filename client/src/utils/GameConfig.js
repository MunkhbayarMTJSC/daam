const tileSize = 48;
const boardSize = 10;
function getBoardOffsets(scene) {
    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2;
    const offsetX = centerX - (tileSize * boardSize / 2);
    const offsetY = centerY - (tileSize * boardSize / 2);
    return { offsetX, offsetY ,centerX, centerY};
}
  
export default {
    tileSize,
    boardSize,
    getBoardOffsets
};