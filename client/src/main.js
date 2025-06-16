import Phaser from 'phaser';
import MainLobby from './scenes/MainLobby';
import PreloadScene from './scenes/PreloadScene';
import FriendLobby from './scenes/FriendLobby';
import GameScene from './scenes/GameScene';

const gameCanvas = document.getElementById('gameCanvas');

const config = {
  type: Phaser.WEBGL,
  width: 416,
  height: 740,
  canvas: gameCanvas,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [PreloadScene, MainLobby, FriendLobby, GameScene],
};

const game = new Phaser.Game(config);

game.scene.start('MainLobby');
