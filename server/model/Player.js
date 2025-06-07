import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: String,
  avatarUrl: String,
  coins: { type: Number, default: 0 },
  gems: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  vip: { type: Boolean, default: false },
  xp: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  gamesWon: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Player = mongoose.model("Player", PlayerSchema);
export default Player;
