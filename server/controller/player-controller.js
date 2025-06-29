import { findOrCreatePlayer } from '../service/player-service.js';

export default function playerController(socket, io, rooms) {
  socket.on('playerConnected', async (data) => {
    try {
      // 1. Өгөгдлийг шалгах
      const player = await findOrCreatePlayer(data);
      const reconnectRoom = rooms.findRoomByUserId(player.userId);
      const reconnectRoomCode = reconnectRoom?.roomCode ?? null;

      // 2. Socket-д мэдээлэл оноох
      socket.player = {
        ...player.toObject(),
        socketId: socket.id,
        reconnectRoomCode,
      };

      // 3. Клиент рүү мэдээлэл буцаах
      socket.emit('playerDataLoaded', socket.player);

      // 4. Reconnect room байвал socketId-г шинэчлэх
      if (reconnectRoom) {
        reconnectRoom.pm.updateSocketId(player.userId, socket.id);
        socket.join(reconnectRoom.roomCode);
        socket.roomCode = reconnectRoom.roomCode;

        // 5. Game-ийн байдал илгээх
        socket.emit('reconnectedToRoom', {
          roomCode: reconnectRoom.roomCode,
          state: reconnectRoom.getSaveData(),
        });

        io.to(reconnectRoom.roomCode).emit('playerReconnected', {
          userId: player.userId,
          socketId: socket.id,
        });

        console.log(`♻️ Reconnected to room: ${reconnectRoom.roomCode}`);
        return;
      }

      console.log(`✅ New player connected: ${player.username}`);
    } catch (err) {
      console.error('❌ Error on playerConnected:', err);
      socket.emit('playerConnectionError', { message: 'Сервер алдаа гарлаа.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected socket:', socket.id);
    const room = rooms.findRoomBySocketId(socket.id);
    if (room) {
      room.pm.removePlayer(socket.id);
    }
  });

  socket.on('requistStats', async () => {
    console.log('✅ Requisted stats:', socket.id);
  });
  socket.on('addXp', async (data) => {
    console.log('✅ EXP added:', socket.id);
  });
  socket.on('updateUsername', async (newName) => {
    socket.emit('usernameUpdated', result);
  });

  socket.on('updateAvatar', async (url) => {
    socket.emit('avatarUpdated', result);
  });
}
