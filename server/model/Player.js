import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: String,
  avatarUrl: String,
  coins: { type: Number, default: 0 },
  gems: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  vip: { type: Boolean, default: false },
  xp: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    levelReach: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    totalCaptures: { type: Number, default: 0 },
    kingsMade: { type: Number, default: 0 },
    usedBackwardCapture: { type: Number, default: 0 },
    winStreak: { type: Number, default: 0 },
    winStreakMax: { type: Number, default: 0 },
    dailyLoginStreak: { type: Number, default: 0 },
    distinctOpponentsToday: { type: Number, default: 0 },
    defeatedVipPlayer: { type: Number, default: 0 },
    winWithEnemyPieces5Plus: { type: Number, default: 0 },
    multiCaptures: {
      double: { type: Number, default: 0 },
      triple: { type: Number, default: 0 },
      quadrupleOrMore: { type: Number, default: 0 },
    },
    dailyMissionsCompleted: Number,
    missionsCompleted: Number,
  },
});

const Player = mongoose.model('Player', PlayerSchema);
export default Player;
