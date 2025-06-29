import Player from "../model/Player.js";
import Mission from "../model/Mission.js";

export async function getMissionsForPlayer() {
  return await Mission.find({ type: "daily" }); // Түр зуурын бүх daily mission-г буцаана
}

export async function completeMission(userId, missionId) {
  const player = await Player.findOne({ userId });
  const mission = await Mission.findById(missionId);

  if (!player || !mission) throw new Error("Player or mission not found");

  // XP нэмэх, урамшуулал олгох, бүртгэх
  player.xp += mission.rewardXp;
  player.stats.missionsCompleted = (player.stats.missionsCompleted || 0) + 1;

  await player.save();

  return { success: true, newXp: player.xp };
}
