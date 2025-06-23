import { circleProfileImg } from '../ui/load-and-show-profile';
import CircularTimer from '../models/circle-timer';
export class PlayersInfo {
  #scene;
  #socket;
  #players;
  #playerColor;
  #myTimer;
  #opponentTimer;
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
    } else {
      this.#myTimer = this.selfPlayerInfo(selfPlayer, {
        x: width * 0.09,
        y: height * 0.86,
      });
      this.#opponentTimer = this.opponentPlayerInfo(opponentPlayer, {
        x: width * 0.9,
        y: height * 0.2,
      });
    }
  }
  selfPlayerInfo(player, pos) {
    if (!player) return;

    circleProfileImg(this.#scene, player.avatarUrl, pos, 40);
    const border = this.#scene.add.graphics();
    border.lineStyle(3, 0x0cc841);
    border.strokeCircle(pos.x, pos.y, 20);
    this.#scene.add
      .text(pos.x + 60, pos.y, player.username, {
        fontSize: '10px',
        color: '#ffffff',
        fontFamily: 'MongolFont',
      })
      .setOrigin(0.5);

    const timer = new CircularTimer(
      this.#scene,
      pos.x,
      pos.y,
      20,
      60000,
      () => {
        console.log(`🟥 ${player.username}-ийн цаг дууслаа`);
      }
    );
    return timer;
  }
  opponentPlayerInfo(player, pos) {
    if (!player) return;

    circleProfileImg(this.#scene, player.avatarUrl, pos, 40);
    const border = this.#scene.add.graphics();
    border.lineStyle(3, 0xfa0b38);
    border.strokeCircle(pos.x, pos.y, 20);
    this.#scene.add
      .text(pos.x - 80, pos.y, player.username, {
        fontSize: '10px',
        color: '#ffffff',
        fontFamily: 'MongolFont',
      })
      .setOrigin(0.5);

    const timer = new CircularTimer(
      this.#scene,
      pos.x,
      pos.y,
      20,
      60000,
      () => {
        console.log(`🟥 ${player.username}-ийн цаг дууслаа`);
      }
    );
    return timer;
  }
  get myTimer() {
    return this.#myTimer;
  }
  get opponentTimer() {
    return this.#opponentTimer;
  }
}
