const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const ModLog = require('../../models/modlogs');
const logError = require('../../utils/logError');

const ENTRIES_PER_PAGE = 5;

function buildEmbed(entries, page, totalPages, targetTag) {
  const embed = new EmbedBuilder()
    .setColor(0xFF6600)
    .setTitle(`📋 Mod Log — ${targetTag}`)
    .setFooter({ text: `Page ${page + 1} of ${totalPages}` })
    .setTimestamp();

  if (entries.length === 0) {
    embed.setDescription("Clean record. Tch. For now.");
    return embed;
  }

  const desc = entries.map(e => {
    let line = `**Case #${e.caseNumber}** | \`${e.action.toUpperCase()}\`\n`;
    line += `**Moderator:** <@${e.moderatorId}>\n`;
    line += `**Reason:** ${e.reason}\n`;
    if (e.duration) line += `**Duration:** ${e.duration}\n`;
    line += `**Date:** <t:${Math.floor(e.createdAt.getTime() / 1000)}:f>\n`;
    return line;
  }).join('\n');

  embed.setDescription(desc);
  return embed;
}

function buildButtons(page, totalPages) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('modlog_prev')
      .setLabel('◀ Previous')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId('modlog_next')
      .setLabel('Next ▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages - 1),
  );
}

async function showModLog(replyFn, editFn, guildId, targetId, targetTag, userId) {
  const allEntries = await ModLog.find({ guildId, targetId }).sort({ createdAt: -1 }).lean();
  const totalPages = Math.max(1, Math.ceil(allEntries.length / ENTRIES_PER_PAGE));
  let page = 0;

  const getPage = (p) => allEntries.slice(p * ENTRIES_PER_PAGE, (p + 1) * ENTRIES_PER_PAGE);

  const msg = await replyFn({
    embeds: [buildEmbed(getPage(0), 0, totalPages, targetTag)],
    components: totalPages > 1 ? [buildButtons(0, totalPages)] : [],
    fetchReply: true,
  });

  if (totalPages <= 1) return;

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.user.id === userId,
    time: 120_000, // 2 minutes
  });

  collector.on('collect', async (i) => {
    if (i.customId === 'modlog_prev') page = Math.max(0, page - 1);
    if (i.customId === 'modlog_next') page = Math.min(totalPages - 1, page + 1);

    await i.update({
      embeds: [buildEmbed(getPage(page), page, totalPages, targetTag)],
      components: [buildButtons(page, totalPages)],
    });
  });

  collector.on('end', async () => {
    try {
      await editFn({
        components: [], // Remove buttons after timeout
      });
    } catch (_) { /* message may be deleted */ }
  });
}

module.exports = {
  name: 'modlog',
  description: 'View the moderation log for a user.',
  category: 'Moderation',
  aliases: ['infractions', 'history'],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [],

  data: new SlashCommandBuilder()
    .setName('modlog')
    .setDescription('View the moderation log for a user.')
    .addUserOption(opt =>
      opt.setName('user').setDescription('The user to look up').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute({ message, args }) {
    const target = message.mentions.users.first();
    if (!target) return message.reply("Tch. Mention someone to look up, extra.");

    try {
      await showModLog(
        (opts) => message.reply(opts),
        (opts) => message.editReply?.(opts).catch(() => null),
        message.guild.id,
        target.id,
        target.tag,
        message.author.id,
      );
    } catch (err) {
      logError({ command: 'modlog', error: err, context: { userTag: message.author.tag, targetId: target.id } });
      await message.reply("Something exploded. And not in the good way.");
    }
  },

  async slashExecute(interaction) {
    const target = interaction.options.getUser('user');

    try {
      await showModLog(
        (opts) => interaction.reply(opts),
        (opts) => interaction.editReply(opts),
        interaction.guild.id,
        target.id,
        target.tag,
        interaction.user.id,
      );
    } catch (err) {
      logError({ command: 'modlog', error: err, context: { userTag: interaction.user.tag, targetId: target.id } });
      await interaction.reply({ content: "Something exploded. And not in the good way.", flags: MessageFlags.Ephemeral });
    }
  },
};