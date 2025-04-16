const { Schema, model } = require('mongoose');

const settingsSchema = new Schema({
  userBlacklist: [String],
  serverBlacklist: [String],
  serverWhitelist: [String],
});

module.exports = model('Settings', settingsSchema);
