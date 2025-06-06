import Phaser from "phaser";

export default class PlayWithFriend extends Phaser.Scene {
  constructor() {
    super("PlayWithFriend");
  }
  init(data) {
    this.data = data;
    this.socket = data.socket;
  }
  preload() {
    this.load.image("bgFriend", "/assets/friends.png");
    this.load.image("createTabBtn", "/assets/create_tab.png");
    this.load.spritesheet("tabButtons", "assets/tab_buttons.png", {
      frameWidth: 300,
      frameHeight: 98,
    });
    this.load.image("createBtn", "/assets/create_btn.png");
    this.load.image("joinBtn", "/assets/join_btn.png");
    this.load.image("tabBg", "/assets/bgTab.png");
  }
  create() {
    const { width, height } = this.scale;

    this.add
      .image(width / 2, height / 2, "bgFriend")
      .setDisplaySize(width, height);

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
        }
      )
      .setOrigin(0.5);
    this.createTabContent.add(createHolder0);
    const createHolder = this.add
      .text(width / 2, height * 0.5, `Таны орооны код:`, {
        fontSize: "24px",
        fill: "#fff",
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
        fontSize: "24px",
        color: "#fff",
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
    const numberButtonStyle = {
      fontSize: "28px",
      color: "#000",
      backgroundColor: "#fff",
      padding: { x: 10, y: 5 },
    };

    const buttonWidth = 60;
    const buttonHeight = 50;
    const startX = width / 2 - buttonWidth * 1.5;
    const startY = height * 0.55;

    for (let i = 1; i <= 9; i++) {
      const x = startX + ((i - 1) % 3) * (buttonWidth + 10);
      const y = startY + Math.floor((i - 1) / 3) * (buttonHeight + 10);

      const btn = this.add
        .text(x, y, String(i), numberButtonStyle)
        .setInteractive()
        .setOrigin(0.5)
        .on("pointerdown", () => {
          if (this.roomCode.length < 6) {
            this.roomCode += String(i);
            this.codeText.setText(this.roomCode);
          }
        });

      this.joinTabContent.add(btn);
    }

    // 0 товч
    const zeroBtn = this.add
      .text(width / 2, startY + (buttonHeight + 10) * 3, "0", numberButtonStyle)
      .setInteractive()
      .setOrigin(0.5)
      .on("pointerdown", () => {
        if (this.roomCode.length < 6) {
          this.roomCode += "0";
          this.codeText.setText(this.roomCode);
        }
      });

    this.joinTabContent.add(zeroBtn);

    // 🔙 Backspace товч
    const backspaceBtn = this.add
      .text(
        width / 2 + buttonWidth + 20,
        startY + (buttonHeight + 10) * 3,
        " ← ",
        numberButtonStyle
      )
      .setInteractive()
      .setOrigin(0.5)
      .on("pointerdown", () => {
        this.roomCode = this.roomCode.slice(0, -1);
        this.codeText.setText(this.roomCode);
      });

    this.joinTabContent.add(backspaceBtn);

    // ❌ Clear товч
    const clearBtn = this.add
      .text(
        width / 2 - buttonWidth - 20,
        startY + (buttonHeight + 10) * 3,
        "Clear",
        numberButtonStyle
      )
      .setInteractive()
      .setOrigin(0.5)
      .on("pointerdown", () => {
        this.roomCode = "";
        this.codeText.setText(this.roomCode);
      });

    this.joinTabContent.add(clearBtn);

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
  createHtmlInputBox() {
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 6;
    input.placeholder = "Өрөөний код";
    input.style.position = "absolute";
    input.style.zIndex = "1000";
    input.style.fontSize = "24px";
    input.style.padding = "10px";
    input.style.border = "2px solid black";
    input.style.borderRadius = "10px";
    input.style.width = "200px";
    input.style.textAlign = "center";

    // Canvas-ийн байрлал дээр байрлуулах
    const canvasBounds = this.game.canvas.getBoundingClientRect();
    input.style.left = canvasBounds.left + this.scale.width / 2 - 100 + "px";
    input.style.top = canvasBounds.top + this.scale.height * 0.55 - 35 + "px";

    document.body.appendChild(input);

    input.focus();

    input.addEventListener("input", () => {
      this.roomCode = input.value;
      this.codeText.setText(this.roomCode);
    });

    // Scene солигдоход input устгах
    this.events.once("shutdown", () => {
      input.remove();
    });
  }
}
