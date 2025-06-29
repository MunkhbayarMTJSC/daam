export default function createCreateRoomUI(scene, container, data) {
  const { width, height } = scene.scale;

  const tabBg = scene.add
    .image(width / 2, height / 2, 'tabBg1')
    .setDisplaySize(width, height);
  container.add(tabBg);

  const codeLabel = scene.add
    .text(width / 2, height * 0.5, `Coming...`, {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'MongolFont',
    })
    .setOrigin(0.5);
  container.add(codeLabel);

  const createBtn = scene.add
    .image(width / 2, height * 0.75, 'createBtn')
    .setScale(0.7)
    .setInteractive({ useHandCursor: true });
  createBtn.on('pointerdown', () =>
    scene.socket.emit('createRoom', { vsBot: false }, (res) => {
      if (res.success) {
        scene.scene.start('GameScene', {
          roomCode: res.roomCode,
          username: res.player.username,
          color: res.playerColor,
          players: [res.player],
        });
      }
    })
  );
  container.add(createBtn);
}
