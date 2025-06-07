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
        coins: 0,
        gems: 0,
        vip: false,
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
      this.coins = data.coins;
      this.gems = data.gems;
      this.level = data.level;
      this.xp = data.level;
      this.gamesPlayed = data.gamesPlayed;
      this.gamesWon = data.gamesWon;
      this.createdAt = data.createdAt;
      localStorage.setItem("playerData", JSON.stringify(data));
      this.headInfo();
      const position = {
        x: 43,
        y: 60,
      };
      loadAndShowProfile(this, this.avatarUrl, this.level, position);
    });
  }

  preload() {}

  create() {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, "bg").setDisplaySize(width, height);
    const data = {
      playerData: localStorage.getItem("playerData"),
      playerObj: JSON.parse(localStorage.getItem("playerData") || "{}"),
      socket: this.socket,
    };
    this.headInfo(data, width, height);
    this.midInfo(data, width, height);
    this.bottomInfo(data, width, height);
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
  headInfo(data, width, height) {
    const coins = this.add
      .image(width * 0.33, height * 0.058, "coins")
      .setScale(0.55)
      .setOrigin(0.5);
    const gems = this.add
      .image(width * 0.33, height * 0.108, "gems")
      .setScale(0.55)
      .setOrigin(0.5);
    const vip = this.add
      .image(width * 0.76, height * 0.083, "vip")
      .setScale(0.68)
      .setOrigin(0.5);
    const msg = this.add
      .image(width * 0.9, height * 0.061, "msg")
      .setScale(0.31)
      .setOrigin(0.5);
    const setting = this.add
      .image(width * 0.9, height * 0.108, "setting")
      .setScale(0.31)
      .setOrigin(0.5);
  }
  midInfo(data, width, height) {
    const missions = this.add
      .image(width * 0.2, height * 0.22, "missions")
      .setScale(0.4)
      .setOrigin(0.5);
    const reward = this.add
      .image(width * 0.5, height * 0.22, "reward")
      .setScale(0.4)
      .setOrigin(0.5);
    const tournament = this.add
      .image(width * 0.8, height * 0.22, "tournament")
      .setScale(0.4)
      .setOrigin(0.5);
    const logo = this.add
      .image(width / 2, height * 0.45, "logo")
      .setScale(0.5)
      .setOrigin(0.5);
    const playFriend = this.add
      .image(width * 0.7, height * 0.72, "playFriend")
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const playOnline = this.add
      .image(width * 0.3, height * 0.72, "playOnline")
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    playFriend.on("pointerdown", () => {
      this.scene.start("PlayWithFriend", data);
    });

    this.tweens.add({
      targets: playFriend,
      scale: { from: 0.3, to: 0.32 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({
      targets: playOnline,
      scale: { from: 0.3, to: 0.32 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
  bottomInfo(data, width, height) {
    const listFriends = this.add
      .image(width * 0.1, height * 0.93, "list_friends")
      .setScale(1)
      .setOrigin(0.5);
    const listRanks = this.add
      .image(width * 0.27, height * 0.93, "list_ranks")
      .setScale(1)
      .setOrigin(0.5);
    const listHome = this.add
      .image(width * 0.5, height * 0.93, "list_home")
      .setScale(1.3)
      .setOrigin(0.5);
    const listBack = this.add
      .image(width * 0.72, height * 0.93, "list_back")
      .setScale(1)
      .setOrigin(0.5);
    const listShop = this.add
      .image(width * 0.9, height * 0.93, "list_shop")
      .setScale(1)
      .setOrigin(0.5);
  }
}
