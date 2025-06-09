// RewardController.js
import * as RewardService from "../services/RewardService.js";

export function setupRewardHandlers(io, socket) {
  socket.on("claim_reward", (data, callback) => {
    const result = RewardService.claimReward(data.playerId, data.rewardId);
    callback(result);
  });
}
