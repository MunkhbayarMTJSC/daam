import {
  getBoardstate,
  selectPiece,
  makeMove,
} from "../service/GameService.js";

import { getRoomByCode } from "../game/RoomManager.js";
export default function GameController(socket, io) {
  socket.on("requestBoardState", (roomCode) => {
    const room = getRoomByCode(roomCode);
    const result = getBoardstate(room);
    if (!result) {
      console.log("Error: Өрөө олдсонгүй!");
      return;
    }
    socket.emit("updateBoard", result);
  });
  // Хүү сонгоход серверт хандаж highlight хийх
  socket.on("selectedPiece", ({ roomCode, pieceId }) => {
    const room = getRoomByCode(roomCode);
    const result = selectPiece(socket.id, pieceId, room);
    socket.emit("highlightMoves", result); // ➡️ зөвхөн тухайн тоглогч руу буцаах
  });
  // Тоглогчийн нүүдэл ирэхэд ахих
  socket.on("playerMove", ({ roomCode, piece, move }) => {
    const room = getRoomByCode(roomCode);
    const result = makeMove(socket.id, piece, move, room);
    for (const id of room.players) {
      io.to(id).emit("updateBoard", result);
    }
  });
  // Ялагч тодроход
  socket.on("gameOver", ({ roomCode, winner }) => {
    console.log("Ялагчийг хүлээж авав", winner);
    io.to(roomCode).emit("gameEnded", { winner });
  });
}
