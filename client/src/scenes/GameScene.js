import ReadyPopup from '../ui/ReadyPopup';
import BoardManager from '../components/models/board-manager.js';
import PieceManager from '../components/models/piece-manager.js';
import GameController from '../utils/GameController.js';
import ShowHighlighter from '../components/ShowHighlighter.js';
import GameSocketHandlers from '../network/GameSocketHandlers';
import RoomSocketHandlers from '../network/RoomSocketHandlers';
import { PlayersInfo } from '../components/ingame/players-info.js';
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
        this.socket.removeAllListeners();

        this.scene.start('MainLobby', this.socket);
      } else {
        console.warn('⚠ socket is undefined!');
      }
    });

    this.socket.off('bothReadyImg');
    this.socket.once('bothReadyImg', (players) => {
      console.log('Bugd belen');
      this.playersInfo = new PlayersInfo(this, players, this.playerColor);
      const currentTurn = this.gameController.getCurrentTurn();
      this.setTurn(currentTurn);
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

  setTurn(currentTurn) {
    if (currentTurn === this.playerColor) {
      this.playersInfo.myTimer.reset();
      this.playersInfo.opponentTimer.pause();
    } else {
      this.playersInfo.myTimer.pause();
      this.playersInfo.opponentTimer.reset();
    }
  }
}
