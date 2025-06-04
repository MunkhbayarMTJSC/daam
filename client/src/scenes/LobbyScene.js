export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super("LobbyScene");
  }

  init(socket) {
    this.socket = socket;
  }

  create() {
    this.add.text(100, 50, "Checkers World Lobby", {
      fontSize: "28px",
      fill: "#fff",
    });

    // Create Room button
    const createBtn = this.add
      .text(100, 120, "[ Тоглоом Үүсгэх ]", { fontSize: "22px", fill: "#0f0" })
      .setInteractive()
      .on("pointerdown", () => {
        this.socket.emit("createRoom");
      });

    // Join Room input
    this.add.text(120, 300, "Өрөөний кодоо оруулнуу:", {
      fontSize: "18px",
      fill: "#fff",
    });
    this.add.text(
      110,
      340,
      `🎮 Өрөөний кодоо оруулан Join Room товч 
          дарвал автоматаар эхлэнэ.`,
      { fontSize: "18px", fill: "#fff" }
    );
    const canvasBounds = this.game.canvas.getBoundingClientRect();
    this.codeInput = document.createElement("input");
    this.codeInput.type = "text";
    this.codeInput.placeholder = "e.g. A1B2C3";

    // Загварын тохиргоо
    this.codeInput.style.position = "absolute";
    this.codeInput.style.left = canvasBounds.left + 380 + "px"; // canvas-ааас баруун тийш 280px
    this.codeInput.style.top = canvasBounds.top + 300 + "px"; // canvas-ааас дээшээс 280px

    this.codeInput.style.width = "160px";
    this.codeInput.style.height = "32px";
    this.codeInput.style.backgroundColor = "#111";
    this.codeInput.style.color = "#0ff";
    this.codeInput.style.border = "2px solid #0ff";
    this.codeInput.style.borderRadius = "4px";
    this.codeInput.style.padding = "5px 10px";
    this.codeInput.style.fontFamily = '"Press Start 2P", monospace';
    this.codeInput.style.fontSize = "14px";
    this.codeInput.style.outline = "none";
    this.codeInput.style.textTransform = "uppercase";
    this.codeInput.style.boxShadow = "0 0 10px #0ff";
    this.codeInput.style.zIndex = 1000;

    document.body.appendChild(this.codeInput);

    // Join Room button
    const joinBtn = this.add
      .text(100, 260, "[ Join Room ]", { fontSize: "22px", fill: "#0ff" })
      .setInteractive()
      .on("pointerdown", () => {
        const code = this.codeInput.value.trim();
        if (code) {
          this.socket.emit("joinRoom", code);
        }
      });

    // Server responses
    this.socket.on("roomCreated", (data) => {
      this.add.text(120, 160, `Таны өрөөний код: ${data.roomCode}`, {
        fontSize: "18px",
        fill: "#fff",
      });
    });

    this.socket.on("roomJoined", (data) => {
      alert(`🎮 Both players joined! Room: ${data.roomCode}`);
      this.scene.start("GameScene", {
        socket: this.socket,
        roomCode: data.roomCode,
        color: data.color,
      });

      if (this.codeInput && this.codeInput.parentNode) {
        this.codeInput.parentNode.removeChild(this.codeInput);
      }
    });

    this.socket.on("errorMessage", (msg) => {
      alert(`❌ ${msg}`);
    });
  }

  update() {
    const canvasBounds = this.game.canvas.getBoundingClientRect();
    this.codeInput.style.left = canvasBounds.left + 380 + "px";
    this.codeInput.style.top = canvasBounds.top + 300 + "px";
  }
  shutdown() {
    if (this.codeInput && this.codeInput.parentNode) {
      this.codeInput.parentNode.removeChild(this.codeInput);
    }
  }

  destroy() {
    if (this.codeInput && this.codeInput.parentNode) {
      this.codeInput.parentNode.removeChild(this.codeInput);
    }
  }
}
