import RoomService from "../service/RoomService.js";

export default function RoomController(socket, io, rooms) {
  socket.on("createRoom", () => RoomService.createRoom(socket, io, rooms));
  socket.on("joinRoom", (roomCode) =>
    RoomService.joinRoom(socket, io, rooms, roomCode)
  );
  socket.on("leaveRoom", (roomCode) =>
    RoomService.leaveRoom(socket, io, rooms, roomCode)
  );
  socket.on("disconnect", () =>
    RoomService.handleDisconnect(socket, io, rooms)
  );
}
