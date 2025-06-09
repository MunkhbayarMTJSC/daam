// server/controller/RoomController.js
import RoomService from "../service/RoomService.js";

export default function RoomController(socket, io) {
  socket.on("createRoom", () => RoomService.createRoom(socket, io));

  socket.on("joinRoom", (roomCode) =>
    RoomService.joinRoom(socket, io, roomCode)
  );

  socket.on("leaveRoom", (roomCode) =>
    RoomService.leaveRoom(socket, io, roomCode)
  );

  socket.on("disconnect", () => RoomService.handleDisconnect(socket, io));
}
