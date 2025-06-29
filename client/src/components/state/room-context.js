export const RoomContext = {
  socket: null,
  roomCode: null,
  isHost: false,
  players: [],
  user: null, // username, avatar, userId гэх мэт
  reset() {
    this.socket = null;
    this.roomCode = null;
    this.isHost = false;
    this.players = [];
    this.user = null;
  },
};
