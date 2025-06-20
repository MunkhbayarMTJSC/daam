import Phaser from 'phaser';
import createRoomTabs from '../ui/RoomTabs.js';
import createCreateRoomUI from '../ui/CreateRoomUI.js';
import createJoinRoomUI from '../ui/JoinRoomUI.js';
import RoomSocketHandlers from '../network/RoomSocketHandlers.js';

export default class FriendLobby extends Phaser.Scene {
  constructor() {
    super('FriendLobby');
  }

  init(data) {
    this.data = data;
    this.socket = data.socket;
  }
  preload() {}
  create() {
    this.cameras.main.fadeIn(500);
    const { width, height } = this.scale;

    // BG & Home Button
    this.add
      .image(width / 2, height / 2, 'bgFriend')
      .setDisplaySize(width, height);
    this.add
      .image(width * 0.08, height * 0.04, 'homeBtn')
      .setScale(0.4)
      .setOrigin(0.5);

    // Табыг үүсгэх
    const { createTab, joinTab, setTab } = createRoomTabs(this);
    this.createTab = createTab;
    this.joinTab = joinTab;
    this.setTab = setTab;

    // Контент контейнерүүд
    this.createTabContent = this.add.container(0, 0).setVisible(true);
    this.joinTabContent = this.add.container(0, 0).setVisible(false);

    // Create Room UI
    this.roomCodeText = null;
    createCreateRoomUI(this, this.createTabContent, this.data);

    // Join Room UI
    this.roomCode = '';
    this.codeText = null;
    createJoinRoomUI(this, this.joinTabContent, this.data);

    // Socket listener-ууд
    RoomSocketHandlers(this);
  }
}
