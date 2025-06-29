export function updateCapturedDisplay(scene, myCaptured, opponentCaptured) {
  const { width, height } = scene.scale;
  if (!scene.capturedText) {
    scene.capturedText = {
      my: scene.add
        .text(width * 0.85, height * 0.86, `${myCaptured}`, {
          fontSize: '40px',
          color: '#ffffff',
          fontFamily: 'MongolFont',
        })
        .setOrigin(1, 0.5),

      opponent: scene.add
        .text(width * 0.15, height * 0.2, `${opponentCaptured}`, {
          fontSize: '40px',
          color: '#ffffff',
          fontFamily: 'MongolFont',
        })
        .setOrigin(0, 0.5),
    };
  } else {
    // ✅ Хэрэв аль хэдийн text байгаа бол зөвхөн текстийг шинэчилье
    scene.capturedText.my.setText(myCaptured);
    scene.capturedText.opponent.setText(opponentCaptured);
  }
}
