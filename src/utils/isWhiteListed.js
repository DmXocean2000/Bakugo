// src/utils/isWhitelisted.js → ../../config.js (up to src/, up to bakugo/)
const { serverWhitelist } = require('../../config.js');

/**
 * Checks if a guild ID is on the server whitelist.
 * Returns false for DMs (no guild) — adjust if you want DM support.
 */
module.exports = function isWhitelisted(guildId) {
  if (!guildId) return false; // DMs or unknown — deny by default
  return serverWhitelist.includes(guildId);
};