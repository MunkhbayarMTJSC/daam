export default function RoomSocketHandlers(scene) {
  scene.socket.on('roomJoined', (data) => {
    console.log('SocketId', data.socketId);
    scene.cameras.main.zoomTo(2, 500);
    scene.time.delayedCall(600, () => {
      scene.scene.start('GameScene', {
        socket: scene.socket,
        roomCode: data.roomCode,
        socketId: data.socketId,
        username: data.username,
        color: data.color,
        players: data.players,
      });
    });
  });

  scene.socket.on('errorMessage', (msg) => {
    alert(`❌ ${msg}`);
  });
}
