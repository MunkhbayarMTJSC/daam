export default class ConfirmPopup extends Phaser.GameObjects.Container {
  constructor(scene, message, onConfirm, onCancel) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.scene = scene;
    this.setDepth(200);
    scene.add.existing(this);

    const bg = scene.add.rectangle(0, 0, 300, 180, 0x000000, 0.8);
    bg.setStrokeStyle(2, 0xffffff);
    this.add(bg);

    const msgText = scene.add
      .text(0, -40, message, {
        fontSize: '16px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: 260 },
        fontFamily: 'MongolFont',
      })
      .setOrigin(0.5);
    this.add(msgText);

    const yesBtn = scene.add
      .text(-60, 40, '✅ Тийм', {
        fontSize: '16px',
        color: '#00ff00',
        backgroundColor: '#222',
        padding: { left: 10, right: 10, top: 4, bottom: 4 },
        fontFamily: 'MongolFont',
      })
      .setOrigin(0.5)
      .setInteractive();

    const noBtn = scene.add
      .text(60, 40, '❌ Үгүй', {
        fontSize: '16px',
        color: '#ff0000',
        backgroundColor: '#222',
        padding: { left: 10, right: 10, top: 4, bottom: 4 },
        fontFamily: 'MongolFont',
      })
      .setOrigin(0.5)
      .setInteractive();

    this.add([yesBtn, noBtn]);

    yesBtn.on('pointerdown', () => {
      this.destroy();
      onConfirm();
    });

    noBtn.on('pointerdown', () => {
      this.destroy();
      if (onCancel) onCancel();
    });
  }
}
