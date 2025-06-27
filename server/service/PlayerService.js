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

  player.stats.gamesPlayed++;
  if (won) {
    player.stats.gamesWon++;
    player.stats.winStreak++;
    if (player.stats.winStreak > player.stats.winStreakMax) {
      player.stats.winStreakMax = player.stats.winStreak;
    }
  } else {
    player.stats.winStreak = 0;
  }
  const total = player.stats.gamesPlayed;
  const wonGames = player.stats.gamesWon;
  console.log('Checks', total, wonGames);
  if (total !== 0) {
    player.stats.winRate = Math.round((wonGames / total) * 100);
  } else {
    player.stats.winRate = 0;
  }
  await player.save();

  return player;
}

function getPlayerInfosFromRoom(roomCode) {
  const room = getRoomByCode(roomCode);
  if (!room) return null;

  return room.players.map((p) => ({
    username: p.username,
    profileImageURL: p.profileImageURL || 'https://yourdomain.com/default.png',
  }));
}

export { findOrCreatePlayer, addXp, recordGameResult, getPlayerInfosFromRoom };
