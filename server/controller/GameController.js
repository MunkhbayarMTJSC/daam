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
  socket.on('requestReplay', (data) => {
    const room = rooms.getRoom(data.roomCode);
    if (!room) {
      console.log('Error: Өрөө олдсонгүй!');
      return;
    }

    const result = {
      pieces: room.gameLogic.pieceManager.pieces,
      currentTurn: room.currentTurn,
      movablePieces: room.gameLogic.currentMovablePieces,
      pieceMoved: false,
      vsBot: data.vsBot,
    };

    io.to(data.roomCode).emit('updateBoard', result);
    const players = room.getPlayerList();
    if (!data.vsBot) {
      io.to(data.roomCode).emit('bothReadyImg', players);
    }
  });

  socket.on('startGameWithBot', (roomCode) => {
    let room = rooms.getRoom(roomCode);

    // Хэрвээ байхгүй бол шинэ өрөө үүсгэнэ
    if (!room) {
      room = rooms.createRoom(
        io,
        socket,
        {
          userId: '',
          username: 'You',
          avatarUrl: '',
        },
        true,
        'bot-room'
      );
      room.addBot();

      room.gameLogic.startGame(); // 🎯 GameLogic-ийн start
    }

    if (room.vsBot && room.currentTurn === room.botColor) {
      setTimeout(() => room.makeBotMove(), 500);
    }

    // 🎁 Клиент рүү мэдээлэл буцаах
    const playerColor = room.getPlayerColor(socket);
    console.log('object :>> ', playerColor);
    const playerList = room.getPlayerList();
    const gameState = {
      players: playerList,
      playerColor,
      roomCode,
      vsBot: true,
      initialData: {
        pieces: room.gameLogic.pieceManager.pieces,
        currentTurn: room.currentTurn,
        movablePieces: room.gameLogic.currentMovablePieces,
        pieceMoved: false,
      },
    };
    socket.emit('gameStartedWithBot', gameState);
  });

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
