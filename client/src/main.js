import Phaser from "phaser";
import GameScene from "./scenes/GameScene.js";
import MainScene from "./scenes/MainScene.js";
import PlayWithFriend from "./scenes/PlayWithFriend.js";
import PreloadScene from "./scenes/PreloadScene.js";

//const socket = io("http://localhost:3000"); // сервертэй холбох

const config = {
  type: Phaser.WEBGL,
  width: 416,
  height: 740,
  canvas: gameCanvas,
  scale: {
    mode: Phaser.Scale.FIT, // ✅ дэлгэцэнд тааруулж сунгах
    autoCenter: Phaser.Scale.CENTER_BOTH, // ✅ canvas-ийг төвд нь байрлуулах
  },
  scene: [PreloadScene, MainScene, PlayWithFriend, GameScene],
};

const game = new Phaser.Game(config);

// LobbyScene эхлүүлж socket дамжуулна
game.scene.start("MainScene");
