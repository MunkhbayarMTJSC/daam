import Phaser from "phaser";
import { loadAndShowProfile } from "./uiHelpers.js";

export default class MainLobby extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  init(socket) {
    this.socket = socket;

    let storedUser = localStorage.getItem("playerData");

    if (!storedUser) {
      const mockPlayer = {
        userId: "local_" + Math.floor(Math.random() * 100000),
        username: "TestUser" + Math.floor(Math.random() * 100),
        avatarUrl:
          "https://api.dicebear.com/7.x/pixel-art/svg?seed=" + Math.random(),
        level: 1,
        xp: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("playerData", JSON.stringify(mockPlayer));
      socket.emit("playerConnected", mockPlayer);
    } else {
      socket.emit("playerConnected", JSON.parse(storedUser));
    }

    // 🔹 Серверээс тоглогчийн мэдээлэл ирсний дараа avatar-г ачаална
    this.socket.on("playerDataLoaded", (data) => {
      this.username = data.username;
      this.avatarUrl = data.avatarUrl;
      this.level = data.level;
      this.xp = data.level;
      this.gamesPlayed = data.gamesPlayed;
      this.gamesWon = data.gamesWon;
      this.createdAt = data.createdAt;

      localStorage.setItem("playerData", JSON.stringify(data));
      loadAndShowProfile(this, this.avatarUrl, this.level);
    });
  }

  preload() {
    this.load.image("bg", "/assets/bg.png");
    this.load.image("playWithFriend", "/assets/play1.png");
    this.load.spritesheet("profileFrames", "assets/profile_frames.png", {
      frameWidth: 100,
      frameHeight: 100,
    });
  }

  create() {
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2, "bg").setDisplaySize(width, height);
    const data = {
      playerData: localStorage.getItem("playerData"),
      playerObj: JSON.parse(localStorage.getItem("playerData") || "{}"),
      socket: this.socket,
    };

    const btn1 = this.add.image(width / 2, height / 2, "playWithFriend");
    btn1.setOrigin(0.5);
    btn1.setScale(0.4);
    btn1.setInteractive({ useHandCursor: true });
    btn1.on("pointerdown", () => {
      this.scene.start("PlayWithFriend", data);
    });

    this.tweens.add({
      targets: btn1,
      scale: { from: 0.4, to: 0.42 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
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

  update() {}
}
