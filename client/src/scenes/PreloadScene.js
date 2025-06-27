export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.load.image('board', 'assets/board.png');
    this.load.spritesheet('pieces', 'assets/pieces.png', {
      frameWidth: 96, // нэг дүрсний өргөн
      frameHeight: 96, // нэг дүрсний өндөр
    });
    this.load.image('playBot', '/assets/playBot.png');
    this.load.image('bgFriend', '/assets/friends.png');
    this.load.image('profile', '/assets/profile.png');
    this.load.image('readyBg', '/assets/readyBg.png');
    this.load.spritesheet('readyBtn', 'assets/readyBtn.png', {
      frameWidth: 150,
      frameHeight: 40,
    });
    this.load.spritesheet('tabButtons', 'assets/tab_buttons.png', {
      frameWidth: 150,
      frameHeight: 79,
    });
    this.load.spritesheet('numpad', 'assets/keyboard.png', {
      frameWidth: 133,
      frameHeight: 75,
    });

    this.load.image('createBtn', '/assets/create_btn.png');
    this.load.image('joinBtn', '/assets/join_btn.png');
    this.load.image('tabBg', '/assets/bgTab.png');
    this.load.image('tabBg1', '/assets/bgTab1.png');
    this.load.image('homeBtn', '/assets/home_btn.png');
    this.load.image('bg', '/assets/bg.png');
    this.load.image('missionBg', '/assets/mission_bg.png');
    this.load.image('close', '/assets/close.png');
    // Top head
    this.load.image('coins', '/assets/coins.png');
    this.load.image('gems', '/assets/gems.png');
    this.load.image('vip', '/assets/vip.png');
    this.load.image('msg', '/assets/msg.png');
    this.load.image('setting', '/assets/setting.png');
    // Mid content
    this.load.image('missions', '/assets/missions.png');
    this.load.image('reward', '/assets/reward.png');
    this.load.image('tournament', '/assets/tournament.png');
    this.load.image('logo', '/assets/Logo.png');
    this.load.image('playFriend', '/assets/play_friends.png');
    this.load.image('playOnline', '/assets/play_online.png');
    // Bot Content
    this.load.image('list_friends', '/assets/list_friends.png');
    this.load.image('list_ranks', '/assets/list_ranks.png');
    this.load.image('list_home', '/assets/list_home.png');
    this.load.image('list_back', '/assets/list_back.png');
    this.load.image('list_shop', '/assets/list_shop.png');

    this.load.spritesheet('profileFrames', 'assets/profile_frames.png', {
      frameWidth: 80,
      frameHeight: 65,
    });
    this.load.image('defaultAvatar', '/assets/avatar1.png');
  }

  create() {
    // Бэлэн бол дараагийн scene рүү шилжинэ
    this.scene.start('MainLobby'); // эсвэл таны эхний Scene
  }
}
