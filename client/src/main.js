import { io } from "socket.io-client";
import Phaser from "phaser";
import LobbyScene from "./scenes/LobbyScene.js";
import GameScene from "./scenes/GameScene.js";
import MainScene from "./scenes/MainScene.js";
import PlayWithFriend from "./scenes/PlayWithFriend.js";

// const socket = io("http://localhost:3000"); // сервертэй холбох
const socket = io("wss://daam-cmwqk8kxl-mbsicas-projects.vercel.app", {
  transports: ["websocket"],
});

const config = {
  type: Phaser.WEBGL,
  width: 416,
  height: 740,
  canvas: gameCanvas,
  scale: {
    mode: Phaser.Scale.FIT, // ✅ дэлгэцэнд тааруулж сунгах
    autoCenter: Phaser.Scale.CENTER_BOTH, // ✅ canvas-ийг төвд нь байрлуулах
  },
  scene: [MainScene, PlayWithFriend, LobbyScene, GameScene],
};

const game = new Phaser.Game(config);

// LobbyScene эхлүүлж socket дамжуулна
game.scene.start("MainScene", socket);
console.log("🔍 Socket server:", import.meta.env.VITE_SOCKET_SERVER_URL);
