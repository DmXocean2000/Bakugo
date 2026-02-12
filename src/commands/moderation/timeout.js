const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logError = require('../../utils/logError');
const createModLog = require('../../utils/createModLog');

const responses = [
  "SIT DOWN AND SHUT UP! You're in timeout! 💥",
  "Tch. Go think about what you did, extra!",
  "You've lost your speaking privileges. Deal with it!",
  "Muted! Finally, some peace and quiet!",
  "Time out, loser! Maybe you'll learn some manners!",
  "I'm putting you in the corner. Stay there and THINK!",
  "Congratulations, you played yourself. Enjoy the silence!",
];

function getRandomResponse() {
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Parses a duration string like "10m", "2h", "1d" into milliseconds.
 * Supports: s (seconds), m (minutes), h (hours), d (days)
 * Discord max timeout is 28 days.
 */
function parseDuration(str) {
  if (!str) return null;

  const match = str.match(/^(\d+)\s*(s|sec|m|min|h|hr|d|day)s?$/i);
  if (!match) return null;

  const val = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const multipliers = {
    s: 1000, sec: 1000,
    m: 60_000, min: 60_000,
    h: 3_600_000, hr: 3_600_000,
    d: 86_400_000, day: 86_400_000,
  };

  const ms = val * (multipliers[unit] || 0);
  if (ms <= 0) return null;

  const maxMs = 28 * 86_400_000;
  if (ms > maxMs) return null;

  return ms;
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s} second${s !== 1 ? 's' : ''}`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m !== 1 ? 's' : ''}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h !== 1 ? 's' : ''}`;
  const d = Math.floor(h / 24);
  return `${d} day${d !== 1 ? 's' : ''}`;
}

module.exports = {
  name: 'timeout',
  description: 'Timeout a user for a specified duration.',
  category: 'Moderation',
  aliases: ['mute', 'stfu'],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],

  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a user for a specified duration.')
    .addUserOption(opt =>
      opt.setName('user').setDescription('The user to timeout').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('duration').setDescription('Duration (e.g. 10m, 2h, 1d)').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for the timeout').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute({ message, args }) {
    const target = message.mentions.members.first();
    if (!target) return message.reply("Tch. Mention someone to timeout, idiot.");

    const durationStr = args[1];
    const ms = parseDuration(durationStr);

    if (!ms) {
      return message.reply("Give me a real duration, extra! Examples: `10m`, `2h`, `1d`. Max is 28 days.");
    }
    if (target.id === message.author.id) {
      return message.reply("Go put yourself in time out by GETTING OFF THE INTERNET, idiot!");
    }
    if (!target.moderatable) {
      return message.reply("I can't timeout that person. They're either above me or protected. Tch.");
    }

    const reason = args.slice(2).join(' ') || 'No reason given. Bakugo decided.';
    const durationText = formatDuration(ms);

    try {
      await target.timeout(ms, reason);
      await createModLog({
        guild: message.guild,
        target: { id: target.user.id, tag: target.user.tag },
        moderator: { id: message.author.id, tag: message.author.tag },
        action: 'timeout',
        reason,
        duration: durationText,
        client: message.client,
      });
      await message.reply(`${getRandomResponse()}\n**${target.user.tag}** has been timed out for **${durationText}**. Reason: *${reason}*`);
    } catch (err) {
      logError({ command: 'timeout', error: err, context: { userTag: message.author.tag, targetTag: target.user.tag } });
      await message.reply("Something exploded. And not in the good way.");
    }
  },

  async slashExecute(interaction) {
    const target = interaction.options.getMember('user');
    const durationStr = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason given. Bakugo decided.';

    if (!target) {
      return interaction.reply({ content: "That user isn't in the server, nerd.", flags: MessageFlags.Ephemeral });
    }
    if (target.id === interaction.user.id) {
      return interaction.reply({ content: "You are so lucky my boss made this an Ephemeral message, extra! Go put yourself in time out by GETTING OFF THE INTERNET, idiot!", flags: MessageFlags.Ephemeral });
    }

    const ms = parseDuration(durationStr);
    if (!ms) {
      return interaction.reply({ content: "Give me a real duration, extra! Examples: `10m`, `2h`, `1d`. Max is 28 days.", flags: MessageFlags.Ephemeral });
    }

    if (!target.moderatable) {
      return interaction.reply({ content: "I can't timeout that person. They're either above me or protected. Tch.", flags: MessageFlags.Ephemeral });
    }

    const durationText = formatDuration(ms);

    try {
      await target.timeout(ms, reason);
      await createModLog({
        guild: interaction.guild,
        target: { id: target.user.id, tag: target.user.tag },
        moderator: { id: interaction.user.id, tag: interaction.user.tag },
        action: 'timeout',
        reason,
        duration: durationText,
        client: interaction.client,
      });
      await interaction.reply(`${getRandomResponse()}\n**${target.user.tag}** has been timed out for **${durationText}**. Reason: *${reason}*`);
    } catch (err) {
      logError({ command: 'timeout', error: err, context: { userTag: interaction.user.tag, targetTag: target.user.tag } });
      await interaction.reply({ content: "Something exploded. And not in the good way.", flags: MessageFlags.Ephemeral });
    }
  },
};