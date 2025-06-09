import {
  getBoardstate,
  selectPiece,
  makeMove,
} from "../service/GameService.js";
export default function GameController(socket, io, rooms) {
  socket.on("requestBoardState", (roomCode) => {
    const result = getBoardstate(roomCode, rooms);
    if (!result) {
      console.log("Error: Өрөө олдсонгүй!");
      return;
    }
    socket.emit("updateBoard", result);
  });
  // Хүү сонгоход серверт хандаж highlight хийх
  socket.on("selectedPiece", ({ roomCode, pieceId }) => {
    const result = selectPiece(socket.id, roomCode, pieceId, rooms);
    socket.emit("highlightMoves", result); // ➡️ зөвхөн тухайн тоглогч руу буцаах
  });
  // Тоглогчийн нүүдэл ирэхэд ахих
  socket.on("playerMove", ({ roomCode, piece, move }) => {
    const result = makeMove(socket.id, roomCode, piece, move, rooms);

    const room = rooms[roomCode];
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
