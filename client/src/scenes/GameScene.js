// client/src/scenes/GameScene.js

import Phaser from "phaser";
import BoardView from "../classes/BoardView.js";
import Pieces from "../classes/PiecesView.js";
import { loadAndShowProfile } from "./uiHelpers.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }
  init(data) {
    this.socket = data.socket;
    this.roomCode = data.roomCode;
    this.isHost = data.isHost;
    this.playerColor = data.color;
    this.allData = data.allData;
  }

  preload() {
    this.load.image("board", "assets/board.png");
    this.load.spritesheet("pieces", "assets/pieces.png", {
      frameWidth: 96, // нэг дүрсний өргөн
      frameHeight: 96, // нэг дүрсний өндөр
    });
  }

  create() {
    const { width, height } = this.scale;
    loadAndShowProfile(
      this,
      this.allData.playerObj.avatarUrl,
      this.allData.playerObj.level
    );
    this.board = new BoardView(this);
    this.pieces = new Pieces(this, this.board, this.playerColor);
    this.currentTurn = 0;
    this.board.draw(width, height);

    const leaveBtn = this.add.text(width * 0.8, height * 0.05, `[Гарах]`, {
      fontSize: "22px",
      fill: "#0ff",
    });
    leaveBtn.setInteractive().on("pointerdown", () => {
      if (this.socket) {
        this.socket.emit("leaveRoom", this.roomCode);
        this.scene.start("MainScene", this.socket);
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
    });
    this.board.setPlayerColor(this.playerColor); // 0 эсвэл 1

    this.socket.on("gameEnded", ({ winner }) => {
      this.scene.start("MainScene", { winner });
    });

    this.events.once("shutdown", () => {
      // Бүх profile элементүүдийг устгах
      if (this.profileElements) {
        this.profileElements.forEach((el) => {
          if (el && el.destroy) el.destroy();
        });
        this.profileElements = null;
      }

      // Texture-г устгах (WebGL дотор устгах шаардлагатай)
      if (this.textures.exists("profileImage")) {
        this.textures.remove("profileImage");
      }

      // Socket listener-уудыг салгах
      if (this.socket) {
        this.socket.removeAllListeners("updateBoard");
        this.socket.removeAllListeners("gameEnded");
      }
    });
  }
}
