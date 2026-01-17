const { ApplicationCommandOptionType } = require('discord.js');
const twentyScoreCountSchema = require('../../models/twentyScoreCountSchema');
const { MessageFlags } = require('discord.js');
module.exports = {
  name: 'twentyscore',
  description: 'Check your 20 Questions score or view the leaderboard.',
  category: 'Fun',
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  options: [
    {
      name: 'user',
      description: 'Check the score for a specific user',
      type: ApplicationCommandOptionType.User,
      required: false,
    }
  ],

  async execute({ message, interaction }) {
    const isInteraction = Boolean(interaction);
    const user = isInteraction 
      ? interaction.options.getUser('user') || interaction.user 
      : message.mentions.users.first() || message.author;

    try {
      const userData = await twentyScoreCountSchema.findOne({ userId: user.id });
      const score = userData?.score || 0;

      const sass = score === 0
        ? "💀 You haven’t guessed a single character right. What are you doing?!"
        : score < 5
          ? `You’ve got **${score}** win${score === 1 ? '' : 's'}. Meh. Try harder.`
          : `You’ve got **${score}** wins. Not bad... for an extra.`;

      const msg = `📊 **${user.username}'s Score:** ${sass}`;

      if (isInteraction) {
        await interaction.reply(msg);
      } else {
        await message.reply(msg);
      }
    } catch (err) {
      console.error('Error fetching score:', err);
      const errorMsg = "Bakugo exploded trying to load the score. Try again later.";
      if (isInteraction) {
        await interaction.reply({ content: errorMsg, flags: MessageFlags.Ephemeral});
      } else {
        await message.reply(errorMsg);
      }
    }
  }
};
