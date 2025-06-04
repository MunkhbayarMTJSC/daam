import { io } from "socket.io-client";
import Phaser from "phaser";
import LobbyScene from "./scenes/LobbyScene.js";
import GameScene from "./scenes/GameScene.js";

const socket = io(import.meta.env.VITE_SOCKET_SERVER_URL, {
  transports: ["websocket"], // optionally, for production stability
});

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#222",
  scene: [LobbyScene, GameScene],
};

const game = new Phaser.Game(config);

// LobbyScene эхлүүлж socket дамжуулна
game.scene.start("LobbyScene", socket);
