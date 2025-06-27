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

export function showReconnectPopup(scene, socket, roomCode, data) {
  const width = scene.scale.width;
  const height = scene.scale.height;

  // Popup background
  const bg = scene.add
    .rectangle(width / 2, height / 2, 400, 200, 0x000000, 0.8)
    .setOrigin(0.5);

  // Text
  const text = scene.add
    .text(
      width / 2,
      height / 2 - 50,
      `Та өрөө ${roomCode} -д өмнө нь тоглож байсан байна.\nДахин холбогдох уу?`,
      {
        fontSize: '18px',
        color: '#ffffff',
        align: 'center',
      }
    )
    .setOrigin(0.5);

  // Yes button
  const yesBtn = scene.add
    .text(width / 2 - 80, height / 2 + 40, 'Тийм', {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#222222',
      padding: { x: 10, y: 5 },
    })
    .setOrigin(0.5)
    .setInteractive();

  // No button
  const noBtn = scene.add
    .text(width / 2 + 80, height / 2 + 40, 'Үгүй', {
      fontSize: '20px',
      color: '#ff0000',
      backgroundColor: '#222222',
      padding: { x: 10, y: 5 },
    })
    .setOrigin(0.5)
    .setInteractive();
  // Click listeners
  yesBtn.on('pointerdown', () => {
    socket.emit('joinRoom', {
      roomCode,
      userId: data.playerObj.userId,
      username: data.playerObj.username,
      avatarUrl: data.avatarUrl,
      reconnecting: true,
    });
    popup.destroy();
  });

  noBtn.on('pointerdown', () => {
    delete socket.player.reconnectRoomCode;
    popup.destroy();
  });

  // Container
  const popup = scene.add.container(0, 0, [bg, text, yesBtn, noBtn]);

  // Optional: popup дээр dark background нэмэх
  popup.setDepth(1000); // Бусад бүх UI дээр гарна
}
