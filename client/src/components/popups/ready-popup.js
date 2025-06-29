export default class ReadyPopup extends Phaser.GameObjects.Container {
  constructor(scene, x, y, socket, roomCode, players) {
    super(scene, x, y);
    console.log('Popup үүссэн', scene);
    this.socket = socket;
    this.roomCode = roomCode;
    this.players = players;
    this.playerElements = {};

    this.bg = scene.add
      .image(0, 0, 'readyBg')
      .setDisplaySize(scene.scale.width, scene.scale.height);
    this.bg.setOrigin(0.5);

    this.roomCodeText = scene.add
      .text(0, -64, roomCode, {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'MongolFont',
        align: 'center',
      })
      .setOrigin(0.5);

    this.readyBtn = this.scene.add
      .sprite(0, 120, 'readyBtn', 0)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.readyBtn.on('pointerdown', () => {
      this.isReady = !this.isReady;
      this.readyBtn.setFrame(this.isReady ? 1 : 0);
      this.socket.emit('playerReady', { roomCode: this.roomCode });
    });

    this.add([this.bg, this.roomCodeText, this.readyBtn]);
    this.setSize(300, 200);
    this.setDepth(1000);
    this.setScrollFactor(0);

    this.updatePlayerList(this.players);

    scene.add.existing(this);
  }

  updatePlayerList(players) {
    Object.values(this.playerElements).forEach((el) => el.destroy());
    if (this.scene === undefined) return;
    this.playerElements = {};
    console.log('Datas ', players, this.scene);
    players.forEach((p, i) => {
      const container = this.scene.add.container();
      const nameText = this.scene.add
        .text(20, 10, `${p.username}`, {
          fontSize: '18px',
          color: '#ffffff',
          fontFamily: 'MongolFont',
          align: 'center',
        })
        .setOrigin(1, 0.5);
      const statusText = this.scene.add
        .text(20, -10, `${p.ready ? 'Ready' : 'Not Ready'}`, {
          fontSize: '10px',
          color: '#ffffff',
          fontFamily: 'MongolFont',
          align: 'center',
        })
        .setOrigin(1, 0.5);

      container.add([statusText, nameText]);

      // Тоглогчийн байрлал
      if (i === 0) {
        container.setPosition(-45, 25); // Улаан тоглогч
      } else {
        container.setPosition(145, 25); // Хар тоглогч
      }

      this.add(container); // Popup container дээр нэмэх
      this.playerElements[p.username] = container;
    });
  }

  startCountdown() {
    let count = 3;

    // 🧊 Fade out other UI
    const elementsToFade = [
      this.bg,
      this.roomCodeText,
      this.readyBtn,
      ...Object.values(this.playerElements),
    ];
    elementsToFade.forEach((el) => {
      this.scene.tweens.add({
        targets: el,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          el.setVisible(false);
        },
      });
    });

    // 🕒 Countdown text
    const countdownText = this.scene.add
      .text(0, 0, count.toString(), {
        fontSize: '120px',
        fontFamily: 'MongolFont',
        color: '#1bda44',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: {
          offsetX: 3,
          offsetY: 3,
          color: '#000000',
          blur: 2,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5);
    this.add(countdownText);

    const interval = this.scene.time.addEvent({
      delay: 1000,
      repeat: 2,
      callback: () => {
        count--;
        countdownText.setText(count > 0 ? count.toString() : 'Go!');

        if (count === 0) {
          this.scene.time.delayedCall(500, () => {
            this.destroy();
            this.socket.emit('startGame', this.roomCode);
          });
        }
      },
    });
  }
}
