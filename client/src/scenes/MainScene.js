import Phaser from "phaser";

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
      this.headInfos();
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

    const btn1 = this.add.image(width / 2, height / 2, "playWithFriend");
    btn1.setOrigin(0.5);
    btn1.setScale(0.4);
    btn1.setInteractive({ useHandCursor: true });
    btn1.on("pointerdown", () => {
      this.scene.start("PlayWithFriend");
    });

    this.tweens.add({
      targets: btn1,
      scale: { from: 0.4, to: 0.42 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  update() {}
  headInfos() {
    // 🔹 Avatar зураг ирсний дараа ачаалж харуулна
    this.load.image("profileImage", this.avatarUrl);
    this.load.once("complete", () => {
      const { width } = this.scale;
      const profileImage = this.add
        .image(width * 0.1, width * 0.1, "profileImage")
        .setDisplaySize(60, 60);
      const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
      maskShape.fillStyle(0xffffff);
      maskShape.fillCircle(width * 0.1, width * 0.1, 30); // x, y байрлал + радиус (35 = 70/2)
      const mask = maskShape.createGeometryMask();
      profileImage.setMask(mask);

      const profileFrame = this.add.sprite(
        width * 0.1,
        width * 0.1,
        "profileFrames",
        3
      );
      profileFrame.setDisplaySize(70, 70);
      this.add.text(width * 0.06, width * 0.135, `LvL ${this.level}`, {
        fontSize: "12px",
        color: "#000000",
      });
    });
    this.load.start();
  }
}
