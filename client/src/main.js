import { io } from 'socket.io-client';
import Phaser from 'phaser';
import LobbyScene from './scenes/LobbyScene.js';
import GameScene from './scenes/GameScene.js';

const socket = io('http://localhost:3000'); // сервертэй холбох

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222',
  scene: [LobbyScene, GameScene],
};

const game = new Phaser.Game(config);

// LobbyScene эхлүүлж socket дамжуулна
game.scene.start('LobbyScene', socket);
