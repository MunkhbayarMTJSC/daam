// MissionController.js
import {
  getMissionsForPlayer,
  completeMission,
} from "../service/MissionService.js";

export default function MissionController(socket, io) {
  socket.on("get_missions", async (callback) => {
    const missions = await getMissionsForPlayer();
    callback(missions);
  });

  socket.on("complete_mission", async ({ playerId, missionId }, callback) => {
    const result = await completeMission(playerId, missionId);
    callback(result);
  });
}
