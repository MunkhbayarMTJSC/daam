export function showMission(scene) {
  const { width, height } = scene.scale;
  // Popup background
  const popupBg = scene.add
    .image(width / 2, height / 2, 'missionBg')
    .setDisplaySize(width, height);

  // Хаах товч
  const closeBtn = scene.add
    .image(width * 0.88, height * 0.21, 'close')
    .setScale(0.7)
    .setInteractive({ useHandCursor: true });

  // Хаах товч дарахад бүх popup элементүүдийг устгана
  closeBtn.on('pointerdown', () => {
    popupBg.destroy();
    closeBtn.destroy();
    missionTexts.forEach((text) => text.destroy());
  });

  // Daily миссонуудыг авч харуулах
  let missionTexts = [];
  scene.socket.emit('get_missions', (missions) => {
    const dailyMissions = missions.filter((m) => m.type === 'daily');

    dailyMissions.forEach((mission, index) => {
      const text = scene.add
        .text(
          width * 0.3,
          200 + index * 30,
          `• ${mission.title} (${mission.goal})`,
          {
            fontSize: '16px',
            color: '#000',
          }
        )
        .setOrigin(0.5);
      missionTexts.push(text);
    });
  });
}
