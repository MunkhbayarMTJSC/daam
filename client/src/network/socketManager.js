// client/src/network/SocketManager.js
import { io } from 'socket.io-client';

let socket = null;

export function initSocket(scene) {
  if (!socket) {
    try {
      socket = io(import.meta.env.VITE_SOCKET_SERVER_URL, {
        transports: ['polling', 'websocket'],
      });
      // ✅ socket эвентүүдийг анхнаасаа бүртгэх
      socket.on('reconnectSuccess', (data) => {
        console.log('📥 reconnectSuccess:', data);
        if (scene) {
          scene.cameras.main.zoomTo(2, 500);
          scene.time.delayedCall(600, () => {
            scene.scene.start('GameScene', {
              reconnectData: data,
              socket: socket,
              roomCode: data.roomCode,
              username: data.username,
              color: data.playerColor,
              players: data.players,
            });
          });
        } else {
          console.warn('⚠️ Scene reference байхгүй reconnectSuccess дээр');
        }
      });

      socket.on('errorMessage', (msg) => {
        alert(`❌ ${msg}`);
      });
    } catch (error) {
      console.error('❌ Socket үүсгэхэд алдаа гарлаа:', error);
    }
  }
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
