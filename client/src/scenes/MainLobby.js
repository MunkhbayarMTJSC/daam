import Phaser from 'phaser';

import { getSocket, initSocket } from '../network/socketManager.js';
import { showReconnectPopup } from '../ui/uiHelpers.js';
import PlayerManager from '../components/models/player-manager.js';
import {
  headInfo,
  midInfo,
  bottomInfo,
} from '../components/ui/lobby-buttons.js';

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
      showReconnectPopup(this, this.socket, this.reconnectRoomCode, data);
    }
    headInfo(this, data, width, height);
    midInfo(this, data, width, height);
    bottomInfo(this, data, width, height);
  }

  update() {}
}
