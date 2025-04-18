const { SlashCommandBuilder, ActivityType } = require('discord.js');
const { MessageFlags } = require('discord.js');
module.exports = {
  name: 'status',
  description: 'Change Bakugo’s status message',
  slash: true,
  ownerOnly: true,
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Update Bakugo’s activity status')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Select status type')
        .setRequired(true)
        .addChoices(
          { name: 'Playing', value: 'PLAYING' },
          { name: 'Watching', value: 'WATCHING' },
          { name: 'Listening', value: 'LISTENING' },
          { name: 'Competing', value: 'COMPETING' }
        )
    )
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('What should Bakugo be doing?')
        .setRequired(true)
    ),

  async slashExecute(interaction) {
    const type = interaction.options.getString('type');
    const message = interaction.options.getString('message');

    await interaction.client.user.setActivity(message, {
      type: ActivityType[type],
    });

    await interaction.reply({
      content: `Status changed to ${type.toLowerCase()} "${message}".`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
