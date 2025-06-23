export default function GameController(socket, io, rooms) {
  // Game Start
  socket.on('startGame', (roomCode) => {
    const room = rooms.getRoom(roomCode);
    const data = {
      pieces: room.gameLogic.pieceManager.pieces,
      currentTurn: room.currentTurn,
      movablePieces: room.gameLogic.currentMovablePieces,
      pieceMoved: false,
    };
    if (!data) {
      console.log('Error: Өрөө олдсонгүй!');
      return;
    }
    const players = room.getPlayerList();
    io.to(roomCode).emit('bothReadyImg', players);
    io.to(roomCode).emit('setTurn', data.currentTurn);
    socket.emit('updateBoard', data);
  });
  // Game Reset
  socket.on('requestReplay', (roomCode) => {
    const room = rooms.getRoom(roomCode);
    if (!room) {
      console.log('Error: Өрөө олдсонгүй!');
      return;
    }

    room.resetGame(); // энэ функцийг GameRoom дотор заавал нэмээрэй

    const data = {
      pieces: room.gameLogic.pieceManager.pieces,
      currentTurn: room.currentTurn,
      movablePieces: room.gameLogic.currentMovablePieces,
      pieceMoved: false,
    };

    io.to(roomCode).emit('gameRestarted', data);
    const players = room.getPlayerList();
    io.to(roomCode).emit('bothReadyImg', players);
  });

  // Selection
  socket.on('selectedPiece', ({ roomCode, pieceId }) => {
    const room = rooms.getRoom(roomCode);
    const color = room.getPlayerColor(socket);
    const piece = room.gameLogic.pieceManager.pieces.find(
      (p) => p.id === pieceId
    );
    if (!piece) {
      socket.emit('errorMessage', 'Хүү олдсонгүй!');
      return;
    }
    if (piece.color !== color) {
      socket.emit('errorMessage', 'Энэ хүү таных биш!');
      return;
    }
    const moveChains = room.gameLogic.moveCalculator.getValidMoves(piece);

    io.to(roomCode).emit('clearHighlightMovePath');
    socket.emit('highlightMoves', { piece, moves: moveChains });
  });
  // Тоглогчийн нүүдэл ирэхэд ахих
  socket.on('playerMove', ({ roomCode, piece, moveChain }) => {
    const room = rooms.getRoom(roomCode);
    const playerId = socket.id;
    const result = room.handleMove(playerId, piece, moveChain);
    if (result?.error) return { error: result.error };
    io.to(roomCode).emit('highlightMovePath', { piece, moveChain });
    io.to(roomCode).emit('updateBoard', result);
  });
  // Game over
}
