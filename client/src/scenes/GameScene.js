import ReadyPopup from '../components/popups/ready-popup.js';
import BoardManager from '../components/models/board-manager.js';
import PieceManager from '../components/models/piece-manager.js';
import GameController from '../utils/GameController.js';
import ShowHighlighter from '../components/ShowHighlighter.js';
import GameSocketHandlers from '../network/game-socket-handlers.js';
import { PlayersInfo } from '../components/ingame/players-info.js';
import { getSocket } from '../network/socketManager.js';
export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.socket = getSocket();
    this.roomCode = data.roomCode;
    this.socketId = data.socketId;
    this.username = data.username;
    this.players = data.players;
    this.readyPlayers = {};
    this.initialData = data.initialData;
    this.vsBot = data.vsBot;
    this.isReconnect = !!data.reconnectData;
    this.reconnectData = data.reconnectData || null;
    this.playerColor = data.color;
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
    this.playersInfo = null;
    const playersInfoRef = { current: null };

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
    GameSocketHandlers(
      this,
      this.currentTurn,
      this.gameController,
      this.playerColor,
      playersInfoRef
    );
    if (this.isReconnect) {
      this.playersInfo = new PlayersInfo(this, this.players, this.playerColor);
      playersInfoRef.current = this.playersInfo;
      this.playersInfo.myTimer.gameTimer.start();
      this.playersInfo.opponentTimer.gameTimer.start();
      this.restoreGameState(this.reconnectData);
      const currentTurn = this.gameController.getCurrentTurn();
      this.setTurn(currentTurn);
    } else if (this.vsBot && this.initialData) {
      this.gameController.showMovablePieces(
        this.initialData.pieces,
        this.initialData.currentTurn,
        this.initialData.movablePieces
      );
    } else {
      this.showReadyPopup = (players) => {
        this.readyPopup = new ReadyPopup(
          this,
          width / 2,
          height / 2,
          this.socket,
          this.roomCode,
          players
        );
      };
    }

    const homeBtn = this.add.image(width * 0.065, height * 0.03, 'homeBtn');
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
      this.playersInfo = new PlayersInfo(this, players, this.playerColor);
      playersInfoRef.current = this.playersInfo;
      this.playersInfo.myTimer.gameTimer.start();
      this.playersInfo.opponentTimer.gameTimer.start();
      const currentTurn = this.gameController.getCurrentTurn();
      this.setTurn(currentTurn);
    });
    this.events.once('shutdown', this.cleanup, this);
    this.events.once('destroy', this.cleanup, this);
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
      this.playersInfo.myTimer.timer.reset();
      this.playersInfo.myTimer.gameTimer.unpause();
      this.playersInfo.opponentTimer.timer.pause();
      this.playersInfo.opponentTimer.gameTimer.pause();
    } else {
      this.playersInfo.myTimer.timer.pause();
      this.playersInfo.myTimer.gameTimer.pause();
      this.playersInfo.opponentTimer.timer.reset();
      this.playersInfo.opponentTimer.gameTimer.unpause();
    }
  }
  cleanup() {
    // ✅ playersInfo устгах
    if (this.playersInfo) {
      this.playersInfo.destroy(); // доор тайлбарлана
      this.playersInfo = null;
    }

    // ✅ socket listener-үүдийг арилгах
    if (this.socket) {
      this.socket.removeAllListeners(); // бүх listener цэвэрлэх
    }

    // ✅ sound устгах
    if (this.moveSound) this.moveSound.destroy();
    if (this.captureSound) this.captureSound.destroy();

    // ✅ өөр custom graphics, sprite устгах
    this.boardManager?.destroy?.();
    this.pieceManager?.destroy?.();
    this.readyPopup?.destroy?.();
  }
}
