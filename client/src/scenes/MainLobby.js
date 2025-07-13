import Phaser from 'phaser';

import { getSocket, initSocket } from '../network/socketManager.js';
import PlayerManager from '../components/models/player-manager.js';
import {
  headInfo,
  midInfo,
  bottomInfo,
} from '../components/ui/lobby-buttons.js';
import RecconectPopup from '../components/popups/reconnect-popup.js';

export default class MainLobby extends Phaser.Scene {
  constructor() {
    super('MainLobby');
  }

  init() {
    this.socket = getSocket() || initSocket(this);
    this.playerManager = new PlayerManager(this.socket);
    this.playerManager.loadFromLocal();
    this.playerManager.emitConnectIfNeeded();
    this.playerManager.listenPlayerDataLoaded((data) => {
      this.userId = data.userId;
      this.username = data.username;
      this.avatarUrl = data.avatarUrl;
      this.level = data.level;
      this.coins = data.coins;
      this.gems = data.gems;
      this.reconnectRoomCode = data.reconnectRoomCode;
    });
  }

  preload() {
    this.load.audio('bgMusic', '/assets/audio/bgMusic.mp3');
  }

  create() {
    this.bgMusic = this.sound.add('bgMusic');
    this.bgMusic.play({ loop: true });
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, 'bg').setDisplaySize(width, height);
    const data = {
      playerData: localStorage.getItem('playerData'),
      playerObj: JSON.parse(localStorage.getItem('playerData') || '{}'),
      socket: this.socket,
    };
    if (this.reconnectRoomCode) {
      //Recconect popup
      const reconnectPopup = new RecconectPopup(this, data);
    }
    headInfo(this, data, width, height);
    midInfo(this, data, width, height);
    const playVsBotBtn = this.add
      .image(width * 0.8, height * 0.55, 'playBot')
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    playVsBotBtn.on('pointerdown', () => {
      this.socket.emit('createRoom', { vsBot: true }, (response) => {
        if (response.success) {
          this.scene.start('GameScene', {
            roomCode: response.roomCode,
            username: response.player.username,
            color: response.playerColor,
            players: [response.player],
            vsBot: true,
            initialData: response.initialData ?? null, // хэрэв шууд эхэлвэл
          });
        }
      });
    });

    bottomInfo(this, data, width, height);
  }

  update() {}
}
