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
    const codeInput = document.createElement("input");
    codeInput.type = "text";
    codeInput.placeholder = "e.g. A1B2C3";

    // Загварын тохиргоо
    codeInput.style.position = "absolute";
    codeInput.style.left = "380px";
    codeInput.style.top = "300px";
    codeInput.style.width = "160px";
    codeInput.style.height = "32px";
    codeInput.style.backgroundColor = "#111";
    codeInput.style.color = "#0ff";
    codeInput.style.border = "2px solid #0ff";
    codeInput.style.borderRadius = "4px";
    codeInput.style.padding = "5px 10px";
    codeInput.style.fontFamily = '"Press Start 2P", monospace'; // Retro font
    codeInput.style.fontSize = "14px";
    codeInput.style.outline = "none";
    codeInput.style.textTransform = "uppercase";
    codeInput.style.boxShadow = "0 0 10px #0ff";
    codeInput.style.zIndex = 1000;
    document.body.appendChild(codeInput);

    // Join Room button
    const joinBtn = this.add
      .text(100, 260, "[ Join Room ]", { fontSize: "22px", fill: "#0ff" })
      .setInteractive()
      .on("pointerdown", () => {
        const code = codeInput.value.trim();
        if (code) {
          this.socket.emit("joinRoom", code);
        }
      });

    // Server responses
    this.socket.on("roomCreated", (roomCode) => {
      this.add.text(120, 160, `Таны өрөөний код: ${roomCode}`, {
        fontSize: "18px",
        fill: "#fff",
      });
    });

    this.socket.on("roomJoined", (roomCode) => {
      alert(`🎮 Both players joined! Room: ${roomCode}`);
      this.scene.start("GameScene", {
        socket: this.socket,
        roomCode,
      }); // GameScene рүү шилжих
      if (codeInput && codeInput.parentNode) {
        codeInput.parentNode.removeChild(codeInput);
      }
    });

    this.socket.on("errorMessage", (msg) => {
      alert(`❌ ${msg}`);
    });
  }

  shutdown() {
    // Scene сольж байх үед input устгах
    const input = document.querySelector("input");
    if (input) document.body.removeChild(input);
  }
}
