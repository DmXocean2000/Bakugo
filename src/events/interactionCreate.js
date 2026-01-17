const logError = require('../utils/logError');
const { MessageFlags } = require('discord.js');

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
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
