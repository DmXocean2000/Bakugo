const mongoose = require('mongoose');

const modLogSchema = new mongoose.Schema({
  guildId:    { type: String, required: true, index: true },
  targetId:   { type: String, required: true, index: true },
  targetTag:  { type: String, required: true },
  moderatorId:   { type: String, required: true },
  moderatorTag:  { type: String, required: true },
  action:     { type: String, required: true }, // 'ban', 'unban', 'timeout', 'untimeout', etc.
  reason:     { type: String, default: 'No reason given.' },
  duration:   { type: String, default: null }, // For timeouts, e.g. "10 minutes"
  caseNumber: { type: Number },
  createdAt:  { type: Date, default: Date.now },
});

// Compound index for fast lookups: all cases for a user in a guild
modLogSchema.index({ guildId: 1, targetId: 1, createdAt: -1 });

// Auto-increment case number per guild
modLogSchema.pre('save', async function (next) {
  if (this.isNew && !this.caseNumber) {
    const last = await this.constructor
      .findOne({ guildId: this.guildId })
      .sort({ caseNumber: -1 })
      .lean();
    this.caseNumber = (last?.caseNumber || 0) + 1;
  }
  next();
});

module.exports = mongoose.model('ModLog', modLogSchema);