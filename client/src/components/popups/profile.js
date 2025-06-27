import { circleProfileImg } from '../ui/load-and-show-profile.js';
export default class Profile extends Phaser.GameObjects.Container {
  constructor(scene, data) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.scene = scene;
    this.profileData = data.playerObj;
    this.setDepth(100);
    scene.add.existing(this);
    this.draw();
    this.setSize(width, height);
  }
  draw() {
    const { width, height } = this.scene.scale;
    const blocker = this.scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.5)
      .setInteractive()
      .setDepth(99);
    const bg = this.scene.add
      .image(0, 0, 'profile')
      .setDisplaySize(width, height);
    const proImg = circleProfileImg(
      this.scene,
      this.profileData.avatarUrl,
      { x: 0, y: -70 },
      80
    );
    const userName = this.scene.add
      .text(0, -170, this.profileData.username, {
        fontFamily: 'MongolFont',
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 2,
          stroke: false,
          fill: true,
        },
        stroke: '#ff0000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    const played = this.scene.add
      .text(-105, 95, this.profileData.stats.gamesPlayed, {
        fontSize: '36px',
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    const won = this.scene.add
      .text(0, 95, this.profileData.stats.gamesWon, {
        fontSize: '36px',
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    const winrate = this.scene.add
      .text(105, 95, this.profileData.stats.winRate, {
        fontSize: '36px',
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    const totalCapture = this.scene.add
      .text(105, 195, this.profileData.stats.totalCaptures, {
        fontSize: '36px',
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    const winStreak = this.scene.add
      .text(0, 195, this.profileData.stats.winStreak, {
        fontSize: '36px',
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    const kingsMade = this.scene.add
      .text(-105, 195, this.profileData.stats.kingsMade, {
        fontSize: '36px',
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    const close = this.scene.add.image(160, -240, 'close').setScale(0.7);
    close.setInteractive();
    close.on('pointerdown', () => {
      this.destroy();
    });
    this.add([
      blocker,
      bg,
      proImg,
      userName,
      played,
      won,
      winrate,
      totalCapture,
      winStreak,
      kingsMade,
      close,
    ]);
  }
}
