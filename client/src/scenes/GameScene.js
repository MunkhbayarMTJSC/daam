// client/src/scenes/GameScene.js

import Phaser from "phaser";
import BoardView from "../classes/BoardView.js";
import Pieces from "../classes/PiecesView.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }
  init(data) {
    this.socket = data.socket;
    this.roomCode = data.roomCode;
    this.isHost = data.isHost;
  }

  preload() {
    this.load.image("board", "assets/board.png");
    this.load.spritesheet("pieces", "assets/pieces.png", {
      frameWidth: 48, // нэг дүрсний өргөн
      frameHeight: 48, // нэг дүрсний өндөр
    });
  }

  create() {
    this.board = new BoardView(this);
    this.pieces = new Pieces(this, this.board);
    this.currentTurn = 2;
    this.board.draw();
    this.add.text(5, 5, `Room Code: ${this.roomCode}`, {
      fontSize: "22px",
      fill: "#0ff",
    });
    const leaveBtn = this.add
      .text(700, 10, `[Гарах]`, { fontSize: "22px", fill: "#0ff" })
      .setInteractive()
      .on("pointerdown", () => {
        if (this.socket) {
          this.socket.emit("leaveRoom", this.roomCode);
          this.scene.start("LobbyScene", this.socket);
        } else {
          console.warn("⚠ socket is undefined!");
        }
      });
    this.socket.on("updateBoard", ({ pieces, currentTurn }) => {
      this.pieces.updateBoardFromServer(pieces, currentTurn);
    });
  }
}
