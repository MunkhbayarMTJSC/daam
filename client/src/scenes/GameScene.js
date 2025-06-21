import ReadyPopup from '../ui/ReadyPopup';
import BoardManager from '../components/BoardManager.js';
import PieceManager from '../components/PieceManager.js';
import GameController from '../utils/GameController.js';
import ShowHighlighter from '../components/ShowHighlighter.js';
import GameSocketHandlers from '../network/GameSocketHandlers';
import RoomSocketHandlers from '../network/RoomSocketHandlers';
import {
  loadAndShowProfile,
  circleProfileImg,
} from '../components/ui/ShowProfile.js';
export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.socket = data.socket;
    this.roomCode = data.roomCode;
    this.socketId = data.socketId;
    this.username = data.username;
    this.playerColor = data.color;
    this.players = data.players;
    this.readyPlayers = {};
    if (data.reconnectData) {
      this.playerColor = data.reconnectData.playerColor;
      this.isReconnect = true;
      this.reconnectData = data.reconnectData;
    }
  }
  preload() {
    this.load.audio('moveSound', '/assets/audio/move.wav');
    this.load.audio('captureSound', '/assets/audio/capture.wav');
  }

  create() {
    const bg = this.sound.get('bgMusic');
    if (bg && bg.isPlaying) {
      bg.stop();
    }

    this.moveSound = this.sound.add('moveSound');
    this.captureSound = this.sound.add('captureSound');
    this.cameras.main.fadeIn(500);
    this.currentTurn = 1;
    const { width, height } = this.scale;
    this.boardManager = new BoardManager(this);
    this.pieceManager = new PieceManager(
      this,
      this.boardManager,
      this.playerColor
    );
    this.showHighligher = new ShowHighlighter(
      this,
      this.boardManager,
      this.pieceManager,
      this.currentTurn
    );
    this.gameController = new GameController(
      this,
      this.boardManager,
      this.pieceManager,
      this.playerColor,
      this.showHighligher,
      this.socket
    );
    this.boardManager.draw(width, height);
    this.boardManager.setPlayerColor(this.playerColor);
    if (this.isReconnect) {
      this.restoreGameState(this.reconnectData);
    } else {
      this.readyPopup = new ReadyPopup(
        this,
        width / 2,
        height / 2,
        this.socket,
        this.roomCode,
        this.players
      );
    }

    const homeBtn = this.add.image(width * 0.065, height * 0.03, 'homeBtn');
    this.add.text(width * 0.4, height * 0.02, `Room Code: ${this.roomCode}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'MongolFont',
    });
    homeBtn.setScale(0.35);
    homeBtn.setOrigin(0.5);
    homeBtn.setInteractive().on('pointerdown', () => {
      if (this.socket) {
        this.socket.emit('leaveRoom', this.roomCode);
        this.scene.start('MainLobby', this.socket);
      } else {
        console.warn('⚠ socket is undefined!');
      }
    });

    this.socket.off('bothReadyImg');
    this.socket.on('bothReadyImg', (players) => {
      const mySocketId = this.socket.id;
      const selfPlayer = players.find((p) => p.socketId === mySocketId);
      const opponentPlayer = players.find((p) => p.socketId !== mySocketId);
      if (selfPlayer) {
        const pos = {
          x: width * 0.09,
          y: height * 0.86,
        };
        circleProfileImg(this, selfPlayer.avatarUrl, pos);

        this.add
          .text(width * 0.24, height * 0.86, selfPlayer.username, {
            fontSize: '10px',
            color: '#ffffff',
            fontFamily: 'MongolFont',
          })
          .setOrigin(0.5);
      }
      if (opponentPlayer) {
        const pos = {
          x: width * 0.9,
          y: height * 0.2,
        };
        circleProfileImg(this, opponentPlayer.avatarUrl, pos);

        this.add
          .text(width * 0.75, height * 0.2, opponentPlayer.username, {
            fontSize: '10px',
            color: '#ffffff',
            fontFamily: 'MongolFont',
          })
          .setOrigin(0.5);
      }
    });
    RoomSocketHandlers(this);

    GameSocketHandlers(
      this,
      this.currentTurn,
      this.gameController,
      this.playerColor
    );
  }
  restoreGameState(data) {
    console.log('♻️ Reconnecting game state...', data);

    this.currentTurn = data.currentTurn;

    this.pieceManager.clear();
    this.pieceManager.updatePieces(data.pieces);

    this.gameController.setMoveHistory(data.moveHistory);
    this.gameController.setCurrentTurn(data.currentTurn);

    // Үүний оронд: ээлж ямар ч байсан movable pieces-ийг харуулна,
    // харин дотор нь interactive-г зөвхөн өөрийн ээлж дээр идэвхжүүлнэ.
    this.gameController.showMovablePieces(
      data.pieces,
      data.currentTurn,
      data.movablePieces
    );
  }
}
