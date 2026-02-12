const mongoose = require('mongoose');

const guildSettingsSchema = new mongoose.Schema({
  guildId:        { type: String, required: true, unique: true },
  modLogChannelId: { type: String, default: null },
  // Future-proof: add more per-server settings here
});

module.exports = mongoose.model('GuildSettings', guildSettingsSchema);