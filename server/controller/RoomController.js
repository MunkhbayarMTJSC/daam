export default function RoomController(socket, io, rooms) {
  socket.on('createRoom', ({ userId, username, avatarUrl }) => {
    const room = rooms.createRoom(io, socket, { userId, username, avatarUrl });
    console.log(`Room ${room.roomCode} created by ${username}`);
    const color = room.getPlayerColor(socket);
    const playerList = room.getPlayerList();
    socket.emit('roomJoined', {
      roomCode: room.roomCode,
      username,
      color,
      players: playerList,
    });
    setTimeout(() => {
      socket.emit('updateReadyStatus', { players: playerList });
    }, 100);
  });

  socket.on('joinRoom', ({ roomCode, userId, username, avatarUrl }) => {
    const room = rooms.joinRoom(socket, roomCode, {
      userId,
      username,
      avatarUrl,
    });
    if (!room) {
      socket.emit('roomError', { message: 'Room full or not found' });
      return;
    }
    const playerList = room.getPlayerList();
    const color = room.getPlayerColor(socket);
    room.broadcast('playerJoined', { username });
    socket.emit('roomJoined', {
      roomCode,
      username,
      color,
      players: playerList,
    });
    setTimeout(() => {
      io.to(roomCode).emit('updateReadyStatus', {
        players: playerList,
      });
    }, 100);
  });

  socket.on('playerReady', ({ roomCode }) => {
    const room = rooms.getRoom(roomCode);
    if (!room) return;
    room.setReady(socket.id);
    const playerList = room.getPlayerList();
    io.to(roomCode).emit('updateReadyStatus', { players: playerList });
    if (room.areBothReady()) {
      room.broadcast('bothReady');
      room.gameLogic.startGame();
    }
  });
}
