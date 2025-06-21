import Phaser from 'phaser';

import { getSocket, initSocket } from '../network/socketManager.js';
import { showReconnectPopup } from '../ui/uiHelpers.js';
import PlayerManager from '../components/PlayerManager.js';
import {
  headInfo,
  midInfo,
  bottomInfo,
} from '../components/ui/mainLobbyButtons.js';

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
    this.events.once('shutdown', () => {
      // Бүх profile элементүүдийг устгах
      if (this.profileElements) {
        this.profileElements.forEach((el) => {
          if (el && el.destroy) el.destroy();
        });
        this.profileElements = null;
      }

      // Texture-г устгах (WebGL дотор устгах шаардлагатай)
      if (this.textures.exists('profileImage')) {
        this.textures.remove('profileImage');
      }
      // Socket listener-уудыг салгах
      if (this.socket) {
        this.socket.removeAllListeners('updateBoard');
        this.socket.removeAllListeners('gameEnded');
      }
    });
  }

  update() {}

  showMissionPopup() {
    const { width, height } = this.scale;
    // Popup background
    const popupBg = this.add
      .image(width / 2, height / 2, 'missionBg')
      .setDisplaySize(width, height);

    // Хаах товч
    const closeBtn = this.add
      .image(width * 0.88, height * 0.21, 'close')
      .setScale(0.7)
      .setInteractive({ useHandCursor: true });

    // Хаах товч дарахад бүх popup элементүүдийг устгана
    closeBtn.on('pointerdown', () => {
      popupBg.destroy();
      closeBtn.destroy();
      missionTexts.forEach((text) => text.destroy());
    });

    // Daily миссонуудыг авч харуулах
    let missionTexts = [];
    this.socket.emit('get_missions', (missions) => {
      const dailyMissions = missions.filter((m) => m.type === 'daily');

      dailyMissions.forEach((mission, index) => {
        const text = this.add
          .text(
            width * 0.3,
            200 + index * 30,
            `• ${mission.title} (${mission.goal})`,
            {
              fontSize: '16px',
              color: '#000',
            }
          )
          .setOrigin(0.5);
        missionTexts.push(text);
      });
    });
  }
}
