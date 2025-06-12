const tileSize = 40;
const boardSize = 10;
function getBoardOffsets(scene) {
  const centerX = scene.cameras.main.width / 2;
  const centerY = scene.cameras.main.height / 2;
  const offsetX = 8;
  const offsetY = 193;
  return { offsetX, offsetY, centerX, centerY };
}

export default {
  tileSize,
  boardSize,
  getBoardOffsets,
};
