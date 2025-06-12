export function getBoardstate(room) {
  if (!room) return null;
  return {
    pieces: room.gameLogic.pieceManager.pieces,
    currentTurn: room.currentTurn,
    movablePieces: room.gameLogic.currentMovablePieces,
  };
}
export function selectPiece(playerId, pieceId, room) {
  if (!room) return;

  const color = room.getPlayerColor(playerId);
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

  const moveChains = room.gameLogic.moveCalculator.getValidMoves(piece); // ➡️ valid moves авах

  return {
    piece,
    moves: moveChains,
  };
}

export function makeMove(playerId, piece, moveChain, room) {
  if (!room) {
    socket.emit('errorMessage', 'Өрөө олдсонгүй!');
    return;
  }
  const result = room.handleMove(playerId, piece, moveChain);
  if (result?.error) return { error: result.error };

  return {
    pieces: result.pieces,
    currentTurn: result.currentTurn,
    movablePieces: result.movablePieces,
  };
}
