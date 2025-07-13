import RoomService from '../service/room-service.js';
export default function roomController(socket, io, roomsManager) {
  const service = new RoomService(roomsManager, io);

  // ✅ CREATE ROOM
  socket.on('createRoom', ({ vsBot }, callback) => {
    const room = service.createRoom(socket, vsBot);
    if (!room) {
      console.warn('⚠️ Өрөө үүсгээгүй байна.');
      return;
    }
    const playerColor = room.pm.getColor(socket.id);
    const player = room.pm.getPlayer(socket.id);

    callback?.({
      success: true,
      roomCode: room.roomCode,
      playerColor,
      player,
    });
    console.log(`🏠 Room үүслээ: ${room.roomCode}`);
  });

  // ✅ JOIN ROOM
  socket.on('joinRoom', ({ roomCode }, callback) => {
    const result = service.joinRoom(socket, roomCode);
    if (result.error) {
      return callback?.({ success: false, error: result.error });
    }

    const room = roomsManager.getRoom(roomCode);
    const playerColor = room.pm.getColor(socket.id);
    const player = room.pm.getPlayer(socket.id);

    callback?.({
      success: true,
      roomCode,
      playerColor,
      player,
    });

    io.to(roomCode).emit('playerJoined', {
      players: room.pm.getPlayers(),
    });
  });

  socket.on('cancelConnect', ({ userId }) => {
    console.log(`❌ Reconnect цуцлагдлаа: ${userId}`);
    service.removePlayer(userId);
  });

  // ✅ RECONNECT
  socket.on('reconnectPlayer', ({ userId }, callback) => {
    const room = service.reconnectPlayer(userId, socket);
    if (room) {
      const playerColor = room.pm.getColorByUserId(userId);
      const player = room.pm.getPlayer(socket.id); // Хэрэглэгчийн мэдээлэл

      callback?.({
        success: true,
        roomCode: room.roomCode,
        username: player.username,
        playerColor,
        players: room.pm.getPlayers(),
        reconnectData: room.getSaveData?.(), // Хэрвээ тоглоомын өгөгдөл сэргээх бол
      });
    } else {
      callback?.({ success: false, error: 'Room not found or expired.' });
    }
  });
}
