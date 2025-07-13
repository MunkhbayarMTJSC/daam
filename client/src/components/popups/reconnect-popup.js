export default class RecconectPopup extends Phaser.GameObjects.Container {
  constructor(scene, data) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.scene = scene;
    this.playerObj = data.playerObj;
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
      .rectangle(0, 0, 400, 200, 0x000000, 0.8)
      .setOrigin(0.5);
    const text = this.scene.add
      .text(
        0,
        -50,
        `Та өрөө ${this.playerObj.reconnectRoomCode} -д өмнө нь тоглож байсан байна.\nДахин холбогдох уу?`,
        {
          fontSize: '18px',
          color: '#ffffff',
          align: 'center',
        }
      )
      .setOrigin(0.5);
    // Yes button
    const yesBtn = this.scene.add
      .text(-80, 40, 'Тийм', {
        fontSize: '20px',
        color: '#00ff00',
        backgroundColor: '#222222',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive();

    // No button
    const noBtn = this.scene.add
      .text(80, 40, 'Үгүй', {
        fontSize: '20px',
        color: '#ff0000',
        backgroundColor: '#222222',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive();
    // Click listeners
    yesBtn.on('pointerdown', () => {
      this.scene.socket.emit(
        'reconnectPlayer',
        { userId: this.playerObj.userId },
        (response) => {
          if (response.success) {
            this.scene.scene.start('GameScene', {
              roomCode: response.roomCode,
              username: response.username,
              color: response.playerColor,
              players: response.players,
              reconnectData: response.reconnectData, // Хэрвээ байгаа бол
              isReconnect: true,
            });
            this.destroy();
          } else {
            alert(`❌ Reconnect амжилтгүй: ${response.error}`);
            this.destroy();
          }
        }
      );
    });

    noBtn.on('pointerdown', () => {
      this.scene.socket.emit('cancelConnect', {
        userId: this.playerObj.userId,
      });
      this.list?.forEach((child) => child?.destroy?.());
      this.destroy();
    });
    this.add([blocker, bg, text, yesBtn, noBtn]);
  }
}
