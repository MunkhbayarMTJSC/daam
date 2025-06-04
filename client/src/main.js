import { io } from "socket.io-client";
import Phaser from "phaser";
import LobbyScene from "./scenes/LobbyScene.js";
import GameScene from "./scenes/GameScene.js";

//const socket = io("http://localhost:3000"); // сервертэй холбох
const socket = io(import.meta.env.VITE_SOCKET_SERVER_URL, {
  transports: ["websocket"],
});

const config = {
  type: Phaser.WEBGL,
  width: 800,
  height: 600,
  canvas: gameCanvas,
  scale: {
    mode: Phaser.Scale.FIT, // ✅ дэлгэцэнд тааруулж сунгах
    autoCenter: Phaser.Scale.CENTER_BOTH, // ✅ canvas-ийг төвд нь байрлуулах
  },
  scene: [LobbyScene, GameScene],
};

const game = new Phaser.Game(config);

// LobbyScene эхлүүлж socket дамжуулна
game.scene.start("LobbyScene", socket);
