export default class ReadyPopup extends Phaser.GameObjects.Container {
  constructor(scene, x, y, socket, roomCode, players) {
    super(scene, x, y);

    this.scene = scene;
    this.socket = socket;
    this.roomCode = roomCode;
    this.players = players;

    this.playerTexts = {}; // username -> text map

    // Popup background
    const bg = scene.add.rectangle(0, 0, 300, 200, 0x000000, 0.8);
    bg.setOrigin(0.5);

    // Room Code text (saved to this)
    this.roomCodeText = scene.add
      .text(0, -80, `Room Code: ${roomCode}`, {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'MongolFont',
        align: 'center',
      })
      .setOrigin(0.5);

    // Player list (saved to this)
    this.playerListText = scene.add
      .text(0, -40, 'Waiting for players...', {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'MongolFont',
        align: 'center',
      })
      .setOrigin(0.5);

    // Ready button (saved to this)
    this.readyBtn = scene.add
      .text(0, 50, 'Ready', {
        fontSize: '20px',
        color: '#00ff00',
        fontFamily: 'MongolFont',
        backgroundColor: '#222',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive();

    this.readyBtn.on('pointerdown', () => {
      this.socket.emit('playerReady', { roomCode: this.roomCode });
      this.readyBtn.setText('Waiting...');
      this.readyBtn.disableInteractive();
    });

    // Add all to container
    this.add([bg, this.roomCodeText, this.playerListText, this.readyBtn]);
    this.setSize(300, 200);
    this.setDepth(1000);
    this.setScrollFactor(0);

    // Initial player list
    this.updatePlayerList(this.players);

    // Listen for updates
    this.socket.off('updateReadyStatus');
    this.socket.on('updateReadyStatus', ({ players }) => {
      this.updatePlayerList(players);
    });

    this.socket.on('bothReady', () => {
      this.startCountdown();
    });

    scene.add.existing(this);
  }

  updatePlayerList(players) {
    let content = players
      .map((p) => `${p.username} - ${p.ready ? '✅ Ready' : '❌ Not Ready'}`)
      .join('\n');
    this.playerListText.setText(content);
  }

  startCountdown() {
    let count = 3;

    // 🧊 Fade out other UI
    const elementsToFade = [
      this.roomCodeText,
      this.playerListText,
      this.readyBtn,
    ];
    elementsToFade.forEach((el) => {
      this.scene.tweens.add({
        targets: el,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          el.setVisible(false);
        },
      });
    });

    // 🕒 Countdown text
    const countdownText = this.scene.add
      .text(0, 0, count.toString(), {
        fontSize: '48px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.add(countdownText);

    const interval = this.scene.time.addEvent({
      delay: 1000,
      repeat: 2,
      callback: () => {
        count--;
        countdownText.setText(count > 0 ? count.toString() : 'Start!');

        if (count === 0) {
          this.scene.time.delayedCall(500, () => {
            this.destroy(); // Remove popup
            this.socket.emit('startGame', this.roomCode);
          });
        }
      },
    });
  }
}
