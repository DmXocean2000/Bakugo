const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const responses = [
  // Yes
  "Tch. Obviously yes. Even an extra could figure that out.",
  "Yeah, duh. Next question!",
  "The answer is yes. Now stop wasting my time!",
  "Yes. And if anyone disagrees, I'll blow them up! 💥",
  "Absolutely. I'm never wrong!",
  "Yes! Now get out of my face!",

  // No
  "No. And don't ask again or I'll explode you!",
  "Tch. HELL no!",
  "Not a chance, extra!",
  "The answer is no. Deal with it! 💥",
  "No way. That's the dumbest thing I've ever heard!",
  "Absolutely NOT!",

  // Maybe
  "Tch. I don't know and I don't CARE!",
  "Maybe. But probably not, because you're an extra.",
  "Ask me again and I'll blow up your phone! I DON'T KNOW!",
  "How the hell should I know?! Figure it out yourself!",
  "The answer is... Tch. I'm not wasting brain cells on this!",
  "Hmph. Even my explosions can't predict THAT.",
  "I'd answer but I literally could not care less!",
  "...I'll get back to you. After I destroy something.",
];

module.exports = {
  name: '8ball',
  description: 'Ask Bakugo a yes or no question.',
  category: 'Fun',
  aliases: ['eightball', 'ask'],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  userPermissions: [],
  botPermissions: [],

  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask Bakugo a yes or no question.')
    .addStringOption(opt =>
      opt.setName('question').setDescription('Your question').setRequired(true)
    ),

  async execute({ message, args }) {
    const question = args.join(' ');
    if (!question) return message.reply("Tch. You gotta actually ASK something, idiot!");

    const answer = responses[Math.floor(Math.random() * responses.length)];
    await message.reply(`🎱 **${answer}**`);
  },

  async slashExecute(interaction) {
    const question = interaction.options.getString('question');
    const answer = responses[Math.floor(Math.random() * responses.length)];
    await interaction.reply(`🎱 **${answer}**`);
  },
};