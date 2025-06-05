import Phaser from "phaser";

export default class PlayWithFriend extends Phaser.Scene {
  constructor() {
    super("PlayWithFriend");
  }
  init() {}
  preload() {
    this.load.image("bgFriend", "/assets/friends.png");
    this.load.image("createTabBtn", "/assets/create_tab.png");
    this.load.image("joinTabBtn", "/assets/join_tab.png");
    this.load.image("joinBtn", "/assets/join_btn.png");
    this.load.image("tabBg", "/assets/bgTab.png");
  }
  create() {
    const { width, height } = this.scale;

    this.add
      .image(width / 2, height / 2, "bgFriend")
      .setDisplaySize(width, height);

    // 🟦 Таб товчлуурууд
    const createTabBtn = this.add
      .image(width * 0.25, height * 0.245, "createTabBtn")
      .setScale(1.5)
      .setInteractive();
    const joinTabBtn = this.add
      .image(width * 0.75, height * 0.245, "joinTabBtn")
      .setScale(1.5)
      .setInteractive();

    // 🟢 Контентууд (2 container)
    this.createTabContent = this.add.container(0, 0).setVisible(true);
    this.joinTabContent = this.add.container(0, 0).setVisible(false);

    // 🟨 CREATE ROOM TAB - контент

    const roomCode = Phaser.Math.Between(100000, 999999).toString();
    const codeText = this.add
      .text(width / 2, 50, roomCode, {
        fontSize: "24px",
        color: "#000",
      })
      .setOrigin(0.5);
    const createTabBg = this.add
      .image(width / 2, height / 2, "tabBg")
      .setDisplaySize(width, height);
    this.createTabContent.add(createTabBg);

    this.createTabContent.add(codeText);

    // Join tab
    this.roomCode = "";

    const placeholder = this.add
      .text(width / 2, height * 0.35, "Өрөөний кодоо оруулна уу!", {
        fontSize: "18px",
        color: "#fff",
      })
      .setOrigin(0.5);
    this.codeText = this.add
      .text(width / 2, height * 0.55, "Room code here", {
        fontSize: "24px",
        color: "#000000",
      })
      .setOrigin(0.5);
    const inputBox = this.add
      .rectangle(width / 2, height * 0.55, 240, 50, 0xffffff)
      .setStrokeStyle(2, 0x000000); // Хүрээтэй болгох
    const joinTabBg = this.add
      .image(width / 2, height / 2, "tabBg")
      .setDisplaySize(width, height);
    this.joinTabContent.add(joinTabBg);
    this.joinTabContent.add(placeholder);

    this.joinTabContent.add(inputBox);

    // 🟩 container руу нэмэхгүй бол таб дотор харагдахгүй
    this.joinTabContent.add(this.codeText);

    this.input.keyboard.on("keydown", (event) => {
      const key = event.key;
      if (/^[0-9]$/.test(key) && this.roomCode.length < 6) {
        this.roomCode += key;
      }
      if (key === "Backspace") {
        this.roomCode = this.roomCode.slice(0, -1);
      }
      this.codeText.setText("" + this.roomCode);
    });

    const joinBtn = this.add
      .text(width / 2, 300, "Join", {
        fontSize: "28px",
        backgroundColor: "#00aa00",
        color: "#fff",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive();

    joinBtn.on("pointerdown", () => {
      console.log("Joining with code:", this.roomCode);
      // this.socket.emit('joinRoom', this.roomCode);
    });

    // 🟩 товчийг мөн container дотор оруулна
    this.joinTabContent.add(joinBtn);

    // 🟢 Табаар сольж харуулах
    createTabBtn.on("pointerdown", () => {
      this.createTabContent.setVisible(true);
      this.joinTabContent.setVisible(false);
    });

    joinTabBtn.on("pointerdown", () => {
      this.createTabContent.setVisible(false);
      this.joinTabContent.setVisible(true);
    });
  }
}
