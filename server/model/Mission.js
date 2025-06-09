// models/Mission.js
import mongoose from "mongoose";

const MissionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ["daily", "reach"], required: true },
  goal: { type: Number, required: true },
  statKey: { type: String, required: true }, // жишээ нь "gamesPlayed", "gamesWon"
  rewardXp: { type: Number, default: 0 },
  rewardCoins: { type: Number, default: 0 },
});

const Mission = mongoose.model("Mission", MissionSchema);
export default Mission;
