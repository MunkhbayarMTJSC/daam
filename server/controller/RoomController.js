export default function RoomController(socket, io, rooms) {
  socket.on('createRoom', ({ userId, username, avatarUrl }) => {
    const room = rooms.createRoom(io, socket, { userId, username, avatarUrl });
    console.log(`Room ${room.roomCode} created by ${username}`);
    const color = room.getPlayerColor(socket);
    const playerList = room.getPlayerList();
    socket.emit('roomJoined', {
      roomCode: room.roomCode,
      socketId: socket.id,
      username,
      color,
      players: playerList,
    });
    setTimeout(() => {
      socket.emit('updateReadyStatus', { players: playerList });
    }, 100);
  });

  socket.on(
    'joinRoom',
    ({ roomCode, userId, username, avatarUrl, reconnecting = false }) => {
      const room = rooms.getRoom(roomCode);
      if (!room) {
        socket.emit('roomError', { message: 'Room not found' });
        return;
      }
      const joinedRoom = rooms.joinRoom(socket, roomCode, {
        userId,
        username,
        avatarUrl,
      });
      if (!joinedRoom) {
        socket.emit('roomError', { message: 'Room full or not found' });
        return;
      }
      const playerList = joinedRoom.getPlayerList();
      const color = joinedRoom.getPlayerColor(socket);

      if (!reconnecting) {
        joinedRoom.broadcast('playerJoined', { username });
        socket.emit('roomJoined', {
          roomCode,
          socketId: socket.id,
          username,
          color,
          players: playerList,
        });
        setTimeout(() => {
          io.to(roomCode).emit('updateReadyStatus', {
            players: playerList,
          });
        }, 100);
      }
    }
  );

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
  socket.on('leaveRoom', (roomCode) => {
    const room = rooms.getRoom(roomCode);
    if (!room) return;

    room.removePlayer(socket.id);
    socket.leave(roomCode);

    if (room.players.length === 0) {
      rooms.deleteRoom(roomCode);
      console.log(`❌ Room deleted: ${roomCode}`);
    } else {
      io.to(roomCode).emit('opponentLeft');
    }
  });

  socket.on('disconnect', () => {
    console.log('Тоглогч холболтоос гарсан');
    const roomCode = socket.roomCode;
    const room = rooms.getRoom(roomCode);
    if (!room) return;
    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player) return;
    player.disconnected = true;
    player.disconnectedAt = Date.now();
    for (const other of room.players) {
      if (other.socketId !== socket.id && !other.disconnected) {
        io.to(other.socketId).emit('playerDisconnected', {
          userId: player.userId,
          message: 'Тоглогч гарсан.',
        });
      }
    }
    const allLeft = room.players.every((p) => p.disconnected);
    if (allLeft) {
      rooms.deleteRoom(roomCode);
      console.log(`🔥 Room ${roomCode} устгагдав.`);
    }
  });
}
