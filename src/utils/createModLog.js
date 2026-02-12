const ModLog = require('../models/modlogs');
const GuildSettings = require('../models/guildSettings');
const { EmbedBuilder } = require('discord.js');

const actionColors = {
  ban:       0xFF0000,
  unban:     0x00FF00,
  timeout:   0xFFA500,
  untimeout: 0x00BFFF,
  kick:      0xFF4500,
  warn:      0xFFFF00,
};

/**
 * Creates a mod log entry in MongoDB and posts to the server's modlog channel.
 *
 * @param {Object} opts
 * @param {import('discord.js').Guild} opts.guild
 * @param {Object} opts.target       - { id, tag }
 * @param {Object} opts.moderator    - { id, tag }
 * @param {string} opts.action       - 'ban', 'unban', 'timeout', 'untimeout', etc.
 * @param {string} [opts.reason]
 * @param {string} [opts.duration]   - Human-readable, e.g. "10 minutes"
 * @param {import('discord.js').Client} opts.client
 */
async function createModLog({ guild, target, moderator, action, reason, duration, client }) {
  // Save to DB
  const entry = await ModLog.create({
    guildId: guild.id,
    targetId: target.id,
    targetTag: target.tag,
    moderatorId: moderator.id,
    moderatorTag: moderator.tag,
    action,
    reason: reason || 'No reason given.',
    duration: duration || null,
  });

  // Try to post to the modlog channel
  try {
    const settings = await GuildSettings.findOne({ guildId: guild.id });
    if (!settings?.modLogChannelId) return entry;

    const channel = await client.channels.fetch(settings.modLogChannelId).catch(() => null);
    if (!channel) return entry;

    const embed = new EmbedBuilder()
      .setColor(actionColors[action] || 0x808080)
      .setTitle(`Case #${entry.caseNumber} | ${action.toUpperCase()}`)
      .addFields(
        { name: 'User',      value: `${target.tag} (<@${target.id}>)`, inline: true },
        { name: 'Moderator', value: `${moderator.tag} (<@${moderator.id}>)`, inline: true },
        { name: 'Reason',    value: reason || 'No reason given.' },
      )
      .setTimestamp()
      .setFooter({ text: `Target ID: ${target.id}` });

    if (duration) {
      embed.addFields({ name: 'Duration', value: duration, inline: true });
    }

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('[MODLOG CHANNEL] Failed to post:', err);
  }

  return entry;
}

module.exports = createModLog;