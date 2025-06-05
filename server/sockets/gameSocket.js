export default function handleGameSocket(socket, io, rooms) {
  // Тоглогч өрөөнд ороод сэрвэртэй холбогдож байгаа бол updateEvent дуудна
  socket.on("requestBoardState", (roomCode) => {
    const room = rooms[roomCode];
    if (!room) return;
    const result = {
      pieces: room.gameLogic.pieces,
      currentTurn: room.currentTurn,
      movablePieces: room.gameLogic.currentMovablePieces,
    };
    socket.emit("updateBoard", result);
  });
  // Хүү сонгоход серверт хандаж highlight хийх
  socket.on("selectedPiece", ({ roomCode, pieceId }) => {
    const room = rooms[roomCode];
    if (!room) return;

    const color = room.getPlayerColor(socket.id);
    const piece = room.gameLogic.pieces.find((p) => p.id === pieceId);

    if (!piece) {
      socket.emit("errorMessage", "Хүү олдсонгүй!");
      return;
    }
    if (piece.color !== color) {
      socket.emit("errorMessage", "Энэ хүү таных биш!");
      return;
    }

    const moves = room.gameLogic.getValidMoves(piece); // ➡️ valid moves авах
    socket.emit("highlightMoves", { piece, moves }); // ➡️ зөвхөн тухайн тоглогч руу буцаах
  });
  // Тоглогчийн нүүдэл ирэхэд ахих
  socket.on("playerMove", ({ roomCode, piece, move }) => {
    const room = rooms[roomCode];

    if (!room) {
      socket.emit("errorMessage", "Өрөө олдсонгүй!");
      return;
    }

    const result = room.handleMove(socket.id, piece, move);
    const socketIds = room.players;
    for (const id of socketIds) {
      if (result?.error) {
        socket.emit("errorMessage", result.error);
      } else if (result) {
        // Өрөөнд байгаа БҮХ тоглогчдод шинэчлэл илгээх
        io.to(id).emit("updateBoard", {
          pieces: result.pieces,
          currentTurn: result.currentTurn,
          movablePieces: room.gameLogic.currentMovablePieces, // ✨ нэмэлт
        });
      }
    }
  });
  // Ялагч тодроход
  socket.on("gameOver", ({ roomCode, winner }) => {
    console.log("Ялагчийг хүлээж авав", winner);
    io.to(roomCode).emit("gameEnded", { winner });
  });
}
