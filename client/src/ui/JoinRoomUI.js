export default function createJoinRoomUI(scene, container, data) {
  const { width, height } = scene.scale;

  scene.roomCode = ''; // ✅ Шаардлагатай

  const tabBg = scene.add
    .image(width / 2, height / 2, 'tabBg')
    .setDisplaySize(width, height);
  container.add(tabBg);
  const inputBox = scene.add
    .rectangle(width / 2, height * 0.45, 300, 70, 0xffffff)
    .setStrokeStyle(2, 0x000000);
  container.add(inputBox);

  const placeholder = scene.add
    .text(width / 2, height * 0.35, 'Өрөөний кодоо оруулна уу!', {
      fontSize: '18px',
      color: '#fff',
      fontFamily: 'MongolFont',
    })
    .setOrigin(0.5);
  container.add(placeholder);

  scene.codeText = scene.add
    .text(width / 2, height * 0.45, 'Room code here', {
      fontSize: '32px',
      color: '#000',
    })
    .setOrigin(0.5);
  container.add(scene.codeText);

  const buttonMap = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'clear', 0, 'back'];
  const buttonWidth = 100,
    buttonHeight = 56;
  const startX = width * 0.265,
    startY = height * 0.55;

  buttonMap.forEach((value, index) => {
    const x = startX + (index % 3) * buttonWidth;
    const y = startY + Math.floor(index / 3) * buttonHeight;

    const btn = scene.add
      .sprite(x, y, 'numpad', index)
      .setScale(0.7)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      if (typeof value === 'number') {
        if (scene.roomCode.length < 6) {
          scene.roomCode += String(value);
        }
      } else if (value === 'clear') {
        scene.roomCode = '';
      } else if (value === 'back') {
        scene.roomCode = scene.roomCode.slice(0, -1);
      }
      scene.codeText.setText(scene.roomCode);
    });

    container.add(btn);
  });

  scene.input.keyboard.on('keydown', (event) => {
    const key = event.key;
    if (/^[0-9]$/.test(key) && scene.roomCode.length < 6) {
      scene.roomCode += key;
    }
    if (key === 'Backspace') {
      scene.roomCode = scene.roomCode.slice(0, -1);
    }
    scene.codeText.setText(scene.roomCode);
  });

  const joinBtn = scene.add
    .image(width / 2, height * 0.9, 'joinBtn')
    .setScale(0.7)
    .setInteractive({ useHandCursor: true });
  joinBtn.on('pointerdown', () => {
    scene.socket.emit('joinRoom', { roomCode: scene.roomCode }, (response) => {
      if (response.success) {
        scene.scene.start('GameScene', {
          roomCode: response.roomCode,
          username: response.player.username,
          color: response.playerColor,
          players: [response.player],
        });
      }
    });
  });
  container.add(joinBtn);

  container.setDepth(10);
}
