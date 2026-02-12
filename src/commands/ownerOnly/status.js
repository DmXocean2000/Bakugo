const { SlashCommandBuilder, ActivityType, MessageFlags } = require('discord.js');

const validTypes = {
  playing: ActivityType.Playing,
  watching: ActivityType.Watching,
  listening: ActivityType.Listening,
  competing: ActivityType.Competing,
};

module.exports = {
  name: 'status',
  description: 'Change Bakugo\'s status message.',
  category: 'Owner',
  aliases: [],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: true,
  userPermissions: [],
  botPermissions: [],

  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Update Bakugo\'s activity status.')
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Select status type')
        .setRequired(true)
        .addChoices(
          { name: 'Playing', value: 'playing' },
          { name: 'Watching', value: 'watching' },
          { name: 'Listening', value: 'listening' },
          { name: 'Competing', value: 'competing' },
        )
    )
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('What should Bakugo be doing?')
        .setRequired(true)
    ),

  // !status playing blowing stuff up
  async execute({ message, args }) {
    const typeName = args[0]?.toLowerCase();
    const activityType = validTypes[typeName];

    if (!activityType && activityType !== 0) {
      return message.reply('Tch. Give me a valid type: `playing`, `watching`, `listening`, or `competing`.');
    }

    const text = args.slice(1).join(' ');
    if (!text) {
      return message.reply('You gotta tell me WHAT to set the status to, extra!');
    }

    await message.client.user.setActivity(text, { type: activityType });
    await message.reply(`Status changed to **${typeName}** "${text}". 💥`);
  },

  async slashExecute(interaction) {
    const typeName = interaction.options.getString('type');
    const text = interaction.options.getString('message');
    const activityType = validTypes[typeName];

    await interaction.client.user.setActivity(text, { type: activityType });
    await interaction.reply({
      content: `Status changed to **${typeName}** "${text}". 💥`,
      flags: MessageFlags.Ephemeral,
    });
  },
};