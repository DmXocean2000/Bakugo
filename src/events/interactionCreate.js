const logError = require('../utils/logError');
const isWhitelisted = require('../utils/isWhiteListed.js');
const { MessageFlags } = require('discord.js');

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!isWhitelisted(interaction.guild?.id)) return;
    // 🔍 Autocomplete
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command?.autocomplete) return;

      try {
        await command.autocomplete(interaction);
      } catch (err) {
        logError({
          command: interaction.commandName,
          error: err,
          context: {
            userTag: interaction.user?.tag,
            userId: interaction.user?.id,
            guild: interaction.guild?.name ?? 'DM or Unknown',
            guildId: interaction.guild?.id ?? 'DM or Unknown',
            channel: interaction.channel?.name ?? 'DM or Unknown',
            channelId: interaction.channel?.id ?? 'DM or Unknown',
            interactionType: 'autocomplete'
          }
        });
        console.error(`[AUTOCOMPLETE ERROR]: ${interaction.commandName}`, err);
      }
      return;
    }

    // ⚡ Slash Command
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command?.slashExecute) return;
    // 🔒 User permission check
    if (command.userPermissions?.length) {
      const missing = command.userPermissions.filter(
        perm => !interaction.member.permissions.has(perm)
      );
      if (missing.length) {
        return interaction.reply({
          content: "Tch. You don't have permission to use that command, extra!",
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    // 🔒 Bot permission check
    if (command.botPermissions?.length) {
      const missing = command.botPermissions.filter(
        perm => !interaction.guild.members.me.permissions.has(perm)
      );
      if (missing.length) {
        return interaction.reply({
          content: "I'm missing permissions I need for that. Yell at whoever set up my roles!",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
      try {
        await command.slashExecute(interaction);
      } catch (err) {
        logError({
          command: interaction.commandName,
          error: err,
          context: {
            userTag: interaction.user?.tag,
            userId: interaction.user?.id,
            guild: interaction.guild?.name ?? 'DM or Unknown',
            guildId: interaction.guild?.id ?? 'DM or Unknown',
            channel: interaction.channel?.name ?? 'DM or Unknown',
            channelId: interaction.channel?.id ?? 'DM or Unknown',
            interactionType: 'slash'
          }
        });

        console.error(`[SLASH COMMAND ERROR]: ${interaction.commandName}`, err);
        if (!interaction.replied) {
          await interaction.reply({
            content: 'Something exploded. And not in the good way.',
            flags: MessageFlags.Ephemeral
          });
        }
      }
    }
  });
};
