import { circleProfileImg } from '../ui/load-and-show-profile';
import CircularTimer from '../models/circle-timer';
import { GameTimer } from '../models/game-timer';
export class PlayersInfo {
  #scene;
  #socket;
  #players;
  #playerColor;
  #myTimer;
  #opponentTimer;
  #capturedText = {
    my: null,
    opponent: null,
  };
  constructor(scene, players, playerColor) {
    this.#scene = scene;
    this.#players = players;
    this.#playerColor = playerColor;
    this.#myTimer = null;
    this.#opponentTimer = null;
    this.draw();
  }

  draw() {
    const { width, height } = this.#scene.scale;

    const mySocketId = this.#scene.socket.id;
    const selfPlayer = this.#players.find((p) => p.socketId === mySocketId);
    const opponentPlayer = this.#players.find((p) => p.socketId !== mySocketId);

    this.#capturedText.my = this.#scene.add
      .text(width * 0.85, height * 0.86, '0', {
        fontSize: '40px',
        color: '#ffffff',
        fontFamily: 'MongolFont',
      })
      .setOrigin(1, 0.5);

    // Opponent captured text
    this.#capturedText.opponent = this.#scene.add
      .text(width * 0.15, height * 0.2, '0', {
        fontSize: '40px',
        color: '#ffffff',
        fontFamily: 'MongolFont',
      })
      .setOrigin(0, 0.5);

    if (this.#playerColor === 1) {
      // Улаан бол доор байрлана
      this.#myTimer = this.selfPlayerInfo(selfPlayer, {
        x: width * 0.09,
        y: height * 0.86,
      });
      this.#opponentTimer = this.opponentPlayerInfo(opponentPlayer, {
        x: width * 0.9,
        y: height * 0.2,
      });
      this.#scene.add
        .sprite(width * 0.9, height * 0.86, 'pieces', 1)
        .setScale(0.5)
        .setOrigin(0.5, 0.5);
      this.#scene.add
        .sprite(width * 0.09, height * 0.2, 'pieces', 3)
        .setScale(0.5)
        .setOrigin(0.5, 0.5);
    } else {
      this.#myTimer = this.selfPlayerInfo(selfPlayer, {
        x: width * 0.09,
        y: height * 0.86,
      });
      this.#opponentTimer = this.opponentPlayerInfo(opponentPlayer, {
        x: width * 0.9,
        y: height * 0.2,
      });
      this.#scene.add
        .sprite(width * 0.9, height * 0.86, 'pieces', 3)
        .setScale(0.5)
        .setOrigin(0.5, 0.5);
      this.#scene.add
        .sprite(width * 0.09, height * 0.2, 'pieces', 1)
        .setScale(0.5)
        .setOrigin(0.5, 0.5);
    }
  }
  selfPlayerInfo(player, pos) {
    if (!player) return;

    circleProfileImg(this.#scene, player.avatarUrl, pos, 40);
    const border = this.#scene.add.graphics();
    border.lineStyle(3, 0x0cc841);
    border.strokeCircle(pos.x, pos.y, 20);
    this.#scene.add
      .text(pos.x + 32, pos.y, player.username, {
        fontSize: '10px',
        color: '#ffffff',
        fontFamily: 'MongolFont',
      })
      .setOrigin(0, 0.5);

    const timer = new CircularTimer(
      this.#scene,
      pos.x,
      pos.y,
      20,
      300000,
      () => {
        console.log(`🟥 ${player.username}-ийн цаг дууслаа`);
      }
    );
    const gameTimer = new GameTimer(
      this.#scene,
      pos.x + 32,
      pos.y + 15,
      200,
      5,
      3600000,
      () => {
        console.log('Game Time finish', player.username);
      }
    );
    return { timer, gameTimer };
  }
  opponentPlayerInfo(player, pos) {
    if (!player) return;

    circleProfileImg(this.#scene, player.avatarUrl, pos, 40);
    const border = this.#scene.add.graphics();
    border.lineStyle(3, 0xfa0b38);
    border.strokeCircle(pos.x, pos.y, 20);
    this.#scene.add
      .text(pos.x - 32, pos.y, player.username, {
        fontSize: '10px',
        color: '#ffffff',
        fontFamily: 'MongolFont',
      })
      .setOrigin(1, 0.5);

    const timer = new CircularTimer(
      this.#scene,
      pos.x,
      pos.y,
      20,
      300000,
      () => {
        console.log(`🟥 ${player.username}-ийн цаг дууслаа`);
      }
    );
    const gameTimer = new GameTimer(
      this.#scene,
      pos.x - 232,
      pos.y - 20,
      200,
      5,
      3600000,
      () => {
        console.log('Game Time finish', player.username);
      }
    );
    return { timer, gameTimer };
  }

  get myTimer() {
    return this.#myTimer;
  }
  get opponentTimer() {
    return this.#opponentTimer;
  }
  updateCaptured(myCaptured, opponentCaptured) {
    this.#capturedText.my?.setText(myCaptured);
    this.#capturedText.opponent?.setText(opponentCaptured);
  }
  destroy() {
    this.#myTimer?.timer?.destroy?.();
    this.#myTimer?.gameTimer?.destroy?.();

    this.#opponentTimer?.timer?.destroy?.();
    this.#opponentTimer?.gameTimer?.destroy?.();
    this.#scene.capturedText?.my?.destroy?.();
    this.#scene.capturedText?.opponent?.destroy?.();
    this.#scene.capturedText = null;
    this.#scene = null;
  }
}
