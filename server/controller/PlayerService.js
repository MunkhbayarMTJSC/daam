import Player from '../model/Player.js';

async function findOrCreatePlayer({ userId, username, avatarUrl }) {
  try {
    // Эхлээд хайна
    let player = await Player.findOne({ userId });
    if (player) return player;

    // Хэрвээ байхгүй бол үүсгэнэ
    player = new Player({ userId, username, avatarUrl });
    await player.save();
    console.log(`🆕 New player registered: ${username}`);
    return player;
  } catch (err) {
    // Duplicate алдааг дахин шалгана
    if (err.code === 11000) {
      // Нэгэн зэрэг хоёр холболт орж ирсэн тохиолдол — давхар insert үүссэн
      console.warn(`⚠️ Duplicate insert race condition for userId: ${userId}`);
      return await Player.findOne({ userId }); // Дахин уншина
    } else {
      throw err; // Бусад алдааг шууд шиднэ
    }
  }
}

async function addXp(userId, amount) {
  const player = await Player.findOne({ userId });
  if (!player) throw new Error('Player not found');

  player.xp += amount;

  await player.save();
  return player;
}
async function recordGameResult(userId, won) {
  const player = await Player.findOne({ userId });
  if (!player) throw new Error('Player not found');

  player.gamesPlayed++;
  if (won) player.gamesWon++;
  await player.save();

  return player;
}

async function getPlayerInfosFromRoom(rooms, roomCode) {
  const room = rooms.getRoom(roomCode);
  if (!room) return null;

  const players = await Promise.all(
    room.players.map(async (p) => {
      const player = await Player.findOne({ userId: p.userId });

      return {
        username: player?.username || p.username,
        profileImageURL:
          player?.avatarUrl || 'https://yourdomain.com/default.png',
      };
    })
  );

  return players;
}

export { findOrCreatePlayer, addXp, recordGameResult, getPlayerInfosFromRoom };
