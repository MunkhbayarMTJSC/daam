// client/src/network/SocketManager.js
import { io } from 'socket.io-client';

let socket = null;

export function initSocket() {
  if (!socket) {
    try {
      socket = io('http://localhost:3000');
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
