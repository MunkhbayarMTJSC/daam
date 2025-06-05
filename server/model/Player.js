import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: String,
  avatarUrl: String,
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  gamesWon: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Player = mongoose.model("Player", PlayerSchema);
export default Player;
