import ReadyPopup from './ready-popup';

export default class GameEndPopup extends Phaser.GameObjects.Container {
  constructor(scene, userData) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);

    this.scene = scene;
    this.userData = userData;

    this.setDepth(100);
    scene.add.existing(this); // Container-г scene дээр нэмэх

    this.createPopupUI();
  }

  createPopupUI() {
    const { winner, formatetDuration, moveCount, roomCode, vsBot, players } =
      this.userData;

    const bg = this.scene.add.rectangle(0, 0, 400, 300, 0x000000, 0.7);
    bg.setStrokeStyle(2, 0xffffff);
    this.add(bg);

    const winnerText = this.scene.add
      .text(0, -100, `Winner: ${winner}`, {
        fontSize: '22px',
        color: '#ffffff',
        fontFamily: 'MongolFont',
      })
      .setOrigin(0.5);
    this.add(winnerText);

    const statsText = this.scene.add
      .text(0, -50, `Duration: ${formatetDuration}\nMoves: ${moveCount}`, {
        fontSize: '16px',
        color: '#ffffff',
        align: 'center',
        fontFamily: 'MongolFont',
      })
      .setOrigin(0.5);
    this.add(statsText);

    const replayBtn = this.scene.add
      .text(0, 40, '🔁 Play Again', {
        fontSize: '18px',
        color: '#00ff00',
        backgroundColor: '#222',
        padding: { left: 12, right: 12, top: 6, bottom: 6 },
        fontFamily: 'MongolFont',
      })
      .setOrigin(0.5)
      .setInteractive();

    const backBtn = this.scene.add
      .text(0, 90, '🏠 Main Lobby', {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#444',
        padding: { left: 12, right: 12, top: 6, bottom: 6 },
        fontFamily: 'MongolFont',
      })
      .setOrigin(0.5)
      .setInteractive();

    this.add([replayBtn, backBtn]);

    replayBtn.on('pointerdown', () => {
      this.scene.socket.emit('requestReplay', {
        roomCode,
        vsBot,
      });
      this.destroy();
      this.scene.readyPopup = new ReadyPopup(
        this.scene,
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        this.scene.socket,
        roomCode,
        players
      );
    });

    backBtn.on('pointerdown', () => {
      this.scene.socket.emit('leaveRoom', roomCode);
      this.scene.scene.start('MainLobby', { socket: this.scene.socket });
    });
  }
}
