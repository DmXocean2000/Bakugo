module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    // 🔍 Autocomplete (type === 4)
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command?.autocomplete) return;

      try {
        await command.autocomplete(interaction);
      } catch (err) {
        console.error(`[AUTOCOMPLETE ERROR]: ${interaction.commandName}`, err);
      }
      return;
    }

    // ⚡ Slash Command (type === 2)
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command?.slashExecute) return;

      try {
        await command.slashExecute(interaction);
      } catch (err) {
        console.error(`[SLASH COMMAND ERROR]: ${interaction.commandName}`, err);
        if (!interaction.replied) {
          await interaction.reply({ content: 'Something exploded. And not in the good way.', ephemeral: true });
        }
      }
    }
  });
};
