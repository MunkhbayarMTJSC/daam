import { loadAndShowProfile } from './ShowProfile.js';
import { Coins, Gems } from './CoinsAndGems.js';
export function headInfo(scene, data, width, height) {
  const position = {
    x: 44,
    y: 41,
  };
  loadAndShowProfile(
    scene,
    data.playerObj.avatarUrl,
    data.playerObj.level,
    position
  );
  const coins = new Coins(scene, data.playerObj.coins, {
    x: width * 0.32,
    y: height * 0.035,
  });
  const gems = new Gems(scene, data.playerObj.coins, {
    x: width * 0.32,
    y: height * 0.08,
  });
  const vip = scene.add
    .image(width * 0.76, height * 0.059, 'vip')
    .setScale(0.68)
    .setOrigin(0.5);
  const msg = scene.add
    .image(width * 0.9, height * 0.037, 'msg')
    .setScale(0.31)
    .setOrigin(0.5);
  const setting = scene.add
    .image(width * 0.9, height * 0.084, 'setting')
    .setScale(0.31)
    .setOrigin(0.5);
}
export function midInfo(scene, data, width, height) {
  const missions = scene.add
    .image(width * 0.2, height * 0.2, 'missions')
    .setScale(0.4)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });
  missions.on('pointerdown', () => {
    this.showMissionPopup();
  });

  const reward = scene.add
    .image(width * 0.5, height * 0.2, 'reward')
    .setScale(0.4)
    .setOrigin(0.5);
  const tournament = scene.add
    .image(width * 0.8, height * 0.2, 'tournament')
    .setScale(0.4)
    .setOrigin(0.5);
  const logo = scene.add
    .image(width / 2, height * 0.45, 'logo')
    .setScale(0.5)
    .setOrigin(0.5);
  const playFriend = scene.add
    .image(width * 0.7, height * 0.72, 'playFriend')
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });
  const playOnline = scene.add
    .image(width * 0.3, height * 0.72, 'playOnline')
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });
  playFriend.on('pointerdown', () => {
    scene.cameras.main.zoomTo(2, 500);
    scene.time.delayedCall(600, () => {
      scene.scene.start('FriendLobby', data);
    });
  });

  scene.tweens.add({
    targets: playFriend,
    scale: { from: 0.3, to: 0.32 },
    duration: 1000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
  scene.tweens.add({
    targets: playOnline,
    scale: { from: 0.3, to: 0.32 },
    duration: 800,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}
export function bottomInfo(scene, data, width, height) {
  const listFriends = scene.add
    .image(width * 0.1, height * 0.93, 'list_friends')
    .setScale(1)
    .setOrigin(0.5);
  const listRanks = scene.add
    .image(width * 0.27, height * 0.93, 'list_ranks')
    .setScale(1)
    .setOrigin(0.5);
  const listHome = scene.add
    .image(width * 0.5, height * 0.93, 'list_home')
    .setScale(1.3)
    .setOrigin(0.5);
  const listBack = scene.add
    .image(width * 0.72, height * 0.93, 'list_back')
    .setScale(1)
    .setOrigin(0.5);
  const listShop = scene.add
    .image(width * 0.9, height * 0.93, 'list_shop')
    .setScale(1)
    .setOrigin(0.5);
}
