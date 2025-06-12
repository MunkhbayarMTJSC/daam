// client/src/scenes/GameScene.js

import Phaser from 'phaser';
import BoardView from '../classes/BoardView.js';
import Pieces from '../classes/PiecesView.js';
import UIOverlay from '../utils/UIOverlay.js';
import { loadAndShowProfile, circleProfileImg } from './uiHelpers.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }
  init(data) {
    this.socket = data.socket;
    this.roomCode = data.roomCode;
    this.isHost = data.isHost;
    this.playerColor = data.color;
    this.allData = data.allData;
  }

  preload() {}

  create() {
    const { width, height } = this.scale;
    this.board = new BoardView(this);
    this.ui = new UIOverlay(this);
    this.pieces = new Pieces(this, this.board, this.playerColor);
    this.currentTurn = 0;
    this.board.draw(width, height);
    const homeBtn = this.add.image(width * 0.065, height * 0.03, 'homeBtn');
    this.socket.emit('requestPlayerInfo', this.roomCode, ({ players }) => {
      // Enemy
      let position = {
        x: width * 0.89,
        y: height * 0.21,
      };
      this.add.text(width * 0.6, height * 0.205, players[1].username, {
        fontSize: '14px',
        fill: '#fff',
        fontFamily: 'MongolFont', // ← энд фонтын нэр
      });
      circleProfileImg(this, players[1].proImgURL, 32, position);
      // Me
      position = {
        x: width * 0.11,
        y: height * 0.855,
      };
      this.add.text(width * 0.18, height * 0.85, players[0].username, {
        fontSize: '14px',
        fill: '#fff',
        fontFamily: 'MongolFont', // ← энд фонтын нэр
      });
      circleProfileImg(this, players[0].proImgURL, 32, position);
    });
    this.socket.on('playerDisconnected', (data) => {
      this.add.text(width / 2, height / 2, data.message, {
        fontSize: '14px',
        fill: '#fff',
        fontFamily: 'MongolFont', // ← энд фонтын нэр
      });
    });
    homeBtn.setScale(0.35);
    homeBtn.setOrigin(0.5);
    homeBtn.setInteractive().on('pointerdown', () => {
      if (this.socket) {
        this.socket.emit('leaveRoom', this.roomCode);
        this.scene.start('MainScene', this.socket);
      } else {
        console.warn('⚠ socket is undefined!');
      }
    });

    this.socket.off('updateBoard'); // өмнөх бүртгэлийг устгах

    this.socket.on('updateBoard', (data) => {
      this.currentTurn = data.currentTurn;
      this.pieces.updateBoardFromServer(
        data.pieces,
        data.currentTurn,
        data.movablePieces
      );
    });
    this.board.setPlayerColor(this.playerColor); // 0 эсвэл 1

    this.socket.on('gameEnded', ({ winner }) => {
      this.scene.start('MainScene', { winner });
    });
    this.socket.emit('requestBoardState', this.roomCode);

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
}
