import Phaser from "phaser";

export default class PlayWithFriend extends Phaser.Scene {
  constructor() {
    super("PlayWithFriend");
  }
  init(data) {
    this.data = data;
    this.socket = data.socket;
  }
  preload() {}
  create() {
    const { width, height } = this.scale;
    this.add
      .image(width / 2, height / 2, "bgFriend")
      .setDisplaySize(width, height);
    this.add
      .image(width * 0.08, height * 0.04, "homeBtn")
      .setScale(0.4)
      .setOrigin(0.5);

    // 🟦 Таб товчлуурууд
    this.createTab = this.add
      .sprite(width * 0.25, height * 0.238, "tabButtons", 1)
      .setScale(0.5)
      .setInteractive();

    this.joinTab = this.add
      .sprite(width * 0.75, height * 0.238, "tabButtons", 2)
      .setScale(0.5)
      .setInteractive();

    this.currentTab = "create";

    const createTabBtn = this.createTab.on("pointerdown", () => {
      if (this.currentTab !== "create") {
        this.currentTab = "create";
        this.createTab.setFrame(1); // active
        this.joinTab.setFrame(2); // inactive
      }
    });

    const joinTabBtn = this.joinTab.on("pointerdown", () => {
      if (this.currentTab !== "join") {
        this.currentTab = "join";
        this.createTab.setFrame(0); // inactive
        this.joinTab.setFrame(3); // active
      }
    });

    // 🟢 Контентууд (2 container)
    this.createTabContent = this.add.container(0, 0).setVisible(true);
    this.joinTabContent = this.add.container(0, 0).setVisible(false);

    // 🟨 CREATE ROOM TAB - контент
    const createTabBg = this.add
      .image(width / 2, height / 2, "tabBg")
      .setDisplaySize(width, height);
    this.createTabContent.add(createTabBg);

    // Create Button
    const createBtn = this.add
      .image(width / 2, height * 0.75, "createBtn")
      .setScale(0.7)
      .setInteractive();

    createBtn.on("pointerdown", () => {
      this.socket.emit("createRoom");
    });
    this.createTabContent.add(createBtn);

    // Create Tab Content
    const createHolder0 = this.add
      .text(
        width / 2,
        height * 0.4,
        `1. Create товч дээр дар
2. Найздаа кодоо явуул`,
        {
          fontSize: "18px",
          fill: "#fff",
          fontFamily: "MongolFont", // ← энд фонтын нэр
        }
      )
      .setOrigin(0.5);
    this.createTabContent.add(createHolder0);
    const createHolder = this.add
      .text(width / 2, height * 0.5, `Таны орооны код:`, {
        fontSize: "24px",
        fill: "#fff",
        fontFamily: "MongolFont",
      })
      .setOrigin(0.5);
    this.createTabContent.add(createHolder);
    this.socket.on("roomCreated", (data) => {
      this.roomCodeText?.destroy();
      const roomCode = (this.roomCodeText = this.add
        .text(width / 2, height * 0.6, `${data.roomCode}`, {
          fontSize: "42px",
          fontFamily: "Arial",
          color: "#ffffff",
          backgroundColor: "#000000aa",
          padding: { x: 20, y: 10 },
          align: "center",
          borderRadius: 10,
        })
        .setOrigin(0.5)
        .setStyle({ fontStyle: "bold", shadow: "2px 2px #333" }));

      this.createTabContent.add(roomCode);
    });

    // Join tab content
    this.roomCode = "";

    const placeholder = this.add
      .text(width / 2, height * 0.35, "Өрөөний кодоо оруулна уу!", {
        fontSize: "18px",
        color: "#fff",
        fontFamily: "MongolFont",
      })
      .setOrigin(0.5);

    this.codeText = this.add
      .text(width / 2, height * 0.45, "Room code here", {
        fontSize: "24px",
        color: "#000000",
      })
      .setOrigin(0.5);

    const inputBox = this.add
      .rectangle(width / 2, height * 0.45, 300, 70, 0xffffff)
      .setStrokeStyle(2, 0x000000);

    const joinTabBg = this.add
      .image(width / 2, height / 2, "tabBg")
      .setDisplaySize(width, height);

    this.joinTabContent.add([joinTabBg, placeholder, inputBox, this.codeText]);

    // --------------------
    // 🔢 0–9 товчлуурууд
    // --------------------
    const buttonMap = [1, 2, 3, 4, 5, 6, 7, 8, 9, "clear", 0, "back"];

    const numberButtonStyle = {
      fontSize: "28px",
      color: "#000",
      backgroundColor: "#fff",
      padding: { x: 10, y: 5 },
    };

    const buttonWidth = 100;
    const buttonHeight = 56;
    const startX = width * 0.265;
    const startY = height * 0.55;

    buttonMap.forEach((value, index) => {
      const x = startX + (index % 3) * buttonWidth;
      const y = startY + Math.floor(index / 3) * buttonHeight;

      const btn = this.add
        .sprite(x, y, "numpad", index)
        .setScale(0.7)
        .setInteractive();

      btn.on("pointerdown", () => {
        if (typeof value === "number") {
          if (this.roomCode.length < 6) {
            this.roomCode += String(value);
            this.codeText.setText(this.roomCode);
          }
        } else if (value === "clear") {
          this.roomCode = "";
          this.codeText.setText(this.roomCode);
        } else if (value === "back") {
          this.roomCode = this.roomCode.slice(0, -1);
          this.codeText.setText(this.roomCode);
        }
      });

      this.joinTabContent.add(btn);
    });

    // --------------------
    // ⌨ Keyboard input
    // --------------------
    this.input.keyboard.on("keydown", (event) => {
      const key = event.key;
      if (/^[0-9]$/.test(key) && this.roomCode.length < 6) {
        this.roomCode += key;
      }
      if (key === "Backspace") {
        this.roomCode = this.roomCode.slice(0, -1);
      }
      this.codeText.setText(this.roomCode);
    });

    // Join Button

    const joinBtn = this.add
      .image(width / 2, height * 0.9, "joinBtn")
      .setScale(0.7)
      .setInteractive();

    joinBtn.on("pointerdown", () => {
      console.log("Joining with code:", this.roomCode);
      this.socket.emit("joinRoom", this.roomCode);
    });
    this.joinTabContent.add(joinBtn);

    this.socket.on("roomJoined", (data) => {
      this.scene.start("GameScene", {
        socket: this.socket,
        roomCode: data.roomCode,
        color: data.color,
        allData: this.data,
      });

      if (this.codeInput && this.codeInput.parentNode) {
        this.codeInput.parentNode.removeChild(this.codeInput);
      }
    });

    this.socket.on("errorMessage", (msg) => {
      alert(`❌ ${msg}`);
    });

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
