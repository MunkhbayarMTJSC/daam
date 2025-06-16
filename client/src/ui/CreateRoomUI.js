export default function createCreateRoomUI(scene, container, data) {
  const { width, height } = scene.scale;

  const tabBg = scene.add
    .image(width / 2, height / 2, 'tabBg')
    .setDisplaySize(width, height);
  container.add(tabBg);

  const infoText = scene.add
    .text(
      width / 2,
      height * 0.4,
      `1. Create товч дээр дар\n2. Найздаа кодоо явуул`,
      {
        fontSize: '18px',
        fill: '#fff',
        fontFamily: 'MongolFont',
      }
    )
    .setOrigin(0.5);
  container.add(infoText);

  const codeLabel = scene.add
    .text(width / 2, height * 0.5, `Таны өрөөний код:`, {
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
    scene.socket.emit('createRoom', {
      userId: data.playerObj.userId,
      username: data.playerObj.username,
      avatarUrl: data.playerObj.avatarUrl,
    })
  );
  container.add(createBtn);
}
