import Player from "../model/Player.js";

async function findOrCreatePlayer({ userId, username, avatarUrl }) {
  let player = await Player.findOne({ userId });
  if (!player) {
    player = new Player({ userId, username, avatarUrl });
    await player.save();
    console.log(`🆕 New player registered: ${username}`);
  }
  return player;
}

async function addXp(userId, amount) {
  const player = await Player.findOne({ userId });
  if (!player) throw new Error("Player not found");

  player.xp += amount;

  await player.save();
  return player;
}
async function recordGameResult(userId, won) {
  const player = await Player.findOne({ userId });
  if (!player) throw new Error("Player not found");

  player.gamesPlayed++;
  if (won) player.gamesWon++;
  await player.save();

  return player;
}

function getPlayerInfosFromRoom(roomCode) {
  const room = getRoomByCode(roomCode);
  if (!room) return null;

  return room.players.map((p) => ({
    username: p.username,
    profileImageURL: p.profileImageURL || "https://yourdomain.com/default.png",
  }));
}

export { findOrCreatePlayer, addXp, recordGameResult, getPlayerInfosFromRoom };
