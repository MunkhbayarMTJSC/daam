import { updateCapturedDisplay } from '../ui/uiHelpers.js';
export default function GameSocketHandlers(
  scene,
  currentTurn,
  gameController,
  playerColor
) {
  // 🎯 Эхлээд socket дээрх өмнөх listener-үүдийг цэвэрлэ
  if (scene.socket) {
    scene.socket.off('updateBoard');
    scene.socket.off('gameEnded');
  }

  // ✅ Шинэ listener-үүдийг нэм
  scene.socket.on('updateBoard', (data) => {
    console.log('nuudlees', data);
    currentTurn = data.currentTurn;
    gameController.showMovablePieces(
      data.pieces,
      data.currentTurn,
      data.movablePieces
    );
    console.log(data.pieceMoved, data.isCapture);
    if (data.pieceMoved) {
      if (data.isCapture) {
        scene.sound.play('captureSound');
      } else {
        scene.sound.play('moveSound');
      }
    }

    const { capturedCounts } = data;
    const myColor = playerColor;
    let myCaptured = 0;
    let opponentCaptured = 0;

    if (capturedCounts === undefined) {
      myCaptured = 0;
      opponentCaptured = 0;
    } else {
      opponentCaptured = capturedCounts[1 - myColor];
      myCaptured = capturedCounts[myColor];
    }
    updateCapturedDisplay(scene, myCaptured, opponentCaptured);
  });

  scene.socket.on('errorMessage', (msg) => {
    alert(`❌ ${msg}`);
  });
}
