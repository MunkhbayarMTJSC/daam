export default function createRoomTabs(scene) {
  const { width, height } = scene.scale;

  const createTab = scene.add
    .sprite(width * 0.25, height * 0.238, 'tabButtons', 1)
    .setScale(0.5)
    .setInteractive();

  const joinTab = scene.add
    .sprite(width * 0.75, height * 0.238, 'tabButtons', 2)
    .setScale(0.5)
    .setInteractive();

  let currentTab = 'create';

  const setTab = (tab) => {
    currentTab = tab;
    scene.createTabContent.setVisible(tab === 'create');
    scene.joinTabContent.setVisible(tab === 'join');
    createTab.setFrame(tab === 'create' ? 1 : 0);
    joinTab.setFrame(tab === 'join' ? 3 : 2);
  };

  createTab.on('pointerdown', () => setTab('create'));
  joinTab.on('pointerdown', () => setTab('join'));

  return { createTab, joinTab, setTab };
}
