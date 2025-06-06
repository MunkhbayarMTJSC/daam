const tileSize = 41;
const boardSize = 10;
function getBoardOffsets(scene) {
  const centerX = scene.cameras.main.width / 2;
  const centerY = scene.cameras.main.height / 2;
  const offsetX = 3;
  const offsetY = 187;
  return { offsetX, offsetY, centerX, centerY };
}

export default {
  tileSize,
  boardSize,
  getBoardOffsets,
};
