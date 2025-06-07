import {
  findOrCreatePlayer,
  addXp,
  recordGameResult,
} from "../controller/playerController.js";

export default function handlePlayerSocket(socket, io) {
  socket.on("playerConnected", async (data) => {
    try {
      const player = await findOrCreatePlayer(data);
      socket.player = {
        userId: player.userId,
        username: player.username,
        coins: player.coins,
        gems: player.gems,
        vip: player.vip,
        level: player.level,
        xp: player.xp,
        gamesPlayed: player.gamesPlayed,
        gamesWon: player.gamesWon,
        createdAt: player.createdAt,
      };
      socket.emit("playerDataLoaded", player);
    } catch (err) {
      console.error("Player connection error:", err);
      socket.emit("errorMessage", "Player connection failed.");
    }
  });

  socket.on("addXp", async (amount) => {
    try {
      const updated = await addXp(socket.player.userId, amount);
      socket.emit("xpUpdated", updated);
    } catch (err) {
      console.error("XP add error:", err);
    }
  });

  socket.on("gameEnded", async ({ roomCode, winnerId }) => {
    try {
      const won = socket.player.userId === winnerId;
      const updated = await recordGameResult(socket.player.userId, won);
      socket.emit("gameStatsUpdated", updated);
    } catch (err) {
      console.error("Game result error:", err);
    }
  });
}
