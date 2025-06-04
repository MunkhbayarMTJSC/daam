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
    this.playerColor = data.color;
  }

  preload() {
    this.load.image("board", "assets/board.png");
    this.load.spritesheet("pieces", "assets/pieces.png", {
      frameWidth: 48, // нэг дүрсний өргөн
      frameHeight: 48, // нэг дүрсний өндөр
    });
  }

  create() {
    this.add.text(
      270,
      560,
      `🧑‍💼 Таны өнгө: ${this.playerColor === 0 ? "Улаан" : "Хар"}`,
      {
        fontSize: "20px",
        fill: "#ff0",
      }
    );
    this.board = new BoardView(this);
    this.pieces = new Pieces(this, this.board, this.playerColor);
    this.currentTurn = 0;
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
    this.socket.emit("requestBoardState", this.roomCode);

    this.socket.off("updateBoard"); // өмнөх бүртгэлийг устгах

    this.socket.on("updateBoard", (data) => {
      this.currentTurn = data.currentTurn;
      this.pieces.updateBoardFromServer(
        data.pieces,
        data.currentTurn,
        data.movablePieces
      );
      console.log(data.currentTurn);
    });
    this.board.setPlayerColor(this.playerColor); // 0 эсвэл 1

    this.socket.on("gameEnded", ({ winner }) => {
      this.scene.start("LobbyScene", { winner });
    });
  }
}
