import { updateCapturedDisplay, showGameEndPopup } from '../ui/uiHelpers.js';
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
    scene.socket.off('gameRestarted');
  }

  // ✅ Шинэ listener-үүдийг нэм
  scene.socket.on('updateBoard', (data) => {
    currentTurn = data.currentTurn;
    gameController.showMovablePieces(
      data.pieces,
      data.currentTurn,
      data.movablePieces
    );
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
      myCaptured = capturedCounts[1 - myColor];
      opponentCaptured = capturedCounts[myColor];
    }
    updateCapturedDisplay(scene, myCaptured, opponentCaptured);
  });

  scene.socket.on('gameRestarted', (data) => {
    currentTurn = data.currentTurn;
    gameController.showMovablePieces(
      data.pieces,
      data.currentTurn,
      data.movablePieces
    );
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
      myCaptured = capturedCounts[1 - myColor];
      opponentCaptured = capturedCounts[myColor];
    }
    updateCapturedDisplay(scene, myCaptured, opponentCaptured);
  });

  scene.socket.on('gameEnded', (data) => {
    console.log('🎮 Game ended:', data);
    showGameEndPopup(scene, data);
  });

  scene.socket.on('errorMessage', (msg) => {
    alert(`❌ ${msg}`);
  });
}
