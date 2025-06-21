export default class Player {
  constructor(socket) {
    this.socket = socket;
    this.playerData = null;
  }
  loadFromLocal() {
    const data = localStorage.getItem('playerData');
    if (data) this.playerData = JSON.parse(data);
    return this.playerData;
  }

  saveToLocal(data) {
    this.playerData = data;
    localStorage.setItem('playerData', JSON.stringify(data));
  }
  emitConnectIfNeeded() {
    if (!this.playerData) {
      const mock = {
        userId: 'local_' + Math.floor(Math.random() * 100000),
        username: 'TestUser' + Math.floor(Math.random() * 100),
        avatarUrl:
          'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + Math.random(),
        createdAt: new Date().toISOString(),
      };
      this.saveToLocal(mock);
      this.socket.emit('playerConnected', mock);
    } else {
      this.socket.emit('playerConnected', this.playerData);
    }
  }
  listenPlayerDataLoaded(callback) {
    this.socket.on('playerDataLoaded', (data) => {
      this.saveToLocal(data);
      if (callback) callback(data);
    });
  }
}
