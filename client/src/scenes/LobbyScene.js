export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super("LobbyScene");
  }

  init(socket) {
    this.socket = socket;
  }

  create() {
    this.socket.on("errorMessage", (msg) => {
      alert(`❌ ${msg}`);
    });
  }

  update() {}
}
