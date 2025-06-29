import GameService from '../service/game-service.js';
export default function GameController(socket, io, rooms) {
  const service = new GameService(rooms, io, socket);
  socket.on('playerReady', (data) => {
    const room = rooms.getRoom(data.roomCode);
    if (!room) {
      return socket.emit('roomError', { message: 'Өрөө олдсонгүй' });
    }
    service.setPlayerReady(socket.id, room);
  });

  socket.on('selectedPiece', ({ roomCode, pieceId }) => {
    service.selectPiece(pieceId, roomCode);
  });

  socket.on('playerMove', ({ roomCode, piece, moveChain }) => {
    service.handleMove(roomCode, piece, moveChain);
  });

  socket.on('requestReplay', (data) => {
    service.requistedReplay(data.roomCode, data.vsBot);
  });
  socket.on('leaveRoom', ({ socketId }) => {
    console.log(`❌ Тоглогч өрөөнөөс гарлаа: ${socketId}`);
    service.removePlayer(socketId);
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
}
