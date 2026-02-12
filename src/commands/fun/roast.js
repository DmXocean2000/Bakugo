const { SlashCommandBuilder } = require('discord.js');
const resolveTarget = require('../../utils/resolveTarget');

const roasts = [
  "You're the reason I have anger issues. Well... MORE anger issues!",
  "I've seen better quirks on a ROCK!",
  "If being useless was a quirk, you'd be number one!",
  "You're so forgettable, even a memory quirk couldn't save you!",
  "I've met NPCs with more personality than you!",
  "You bring everyone so much joy... when you leave the room!",
  "Your quirk should be called 'Disappointment' because that's all you deliver!",
  "Even Deku was more impressive than you, and that's saying A LOT!",
  "You're not even worth the sweat off my palms! And that's nitroglycerin!",
  "I'd roast you harder, but I don't want to set the bar lower than it already is!",
  "If brains were dynamite, you wouldn't have enough to blow your nose!",
  "You're like a participation trophy. You exist, but nobody's impressed!",
  "Even my worst explosion is more put-together than you!",
  "I've seen training dummies put up a better fight than you!",
  "The only record you're breaking is for 'Most Forgettable Extra'!",
  "You're the human equivalent of a Monday morning!",
  "If I had a nickel for every brain cell you have, I'd be in debt!",
  "You're proof that even natural selection takes a day off sometimes!",
  "I'd explain it to you, but I left my crayons at home!",
  "Your presence has the same energy as a loading screen that never finishes!",
];

const selfRoasts = [
  "You want me to roast MYSELF?! I'M PERFECT! ...But fine. I guess sometimes I'm TOO explosive. THERE! Happy?!",
  "Roast myself? Tch. The only flaw I have is being TOO DAMN GREAT!",
  "Me? A roast? I'm UNROASTABLE! I'm the number one hero! ...In training. SHUT UP!",
];

module.exports = {
  name: 'roast',
  description: 'Bakugo roasts a user into oblivion.',
  category: 'Fun',
  aliases: ['burn', 'destroy'],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  userPermissions: [],
  botPermissions: [],

  data: new SlashCommandBuilder()
    .setName('roast')
    .setDescription('Bakugo roasts a user into oblivion.')
    .addUserOption(opt =>
      opt.setName('user').setDescription('The victim').setRequired(true)
    ),

  async execute({ message, args }) {
    const target = await resolveTarget(message.guild, args[0]);
    if (!target) return message.reply("Tch. Give me someone to roast, idiot! Mention them or give me an ID!");

    // Self-roast
    if (target.user.id === message.author.id) {
      const roast = selfRoasts[Math.floor(Math.random() * selfRoasts.length)];
      return message.reply(roast);
    }

    // Roast the bot
    if (target.user.id === message.client.user.id) {
      return message.reply("You're trying to roast ME?! I AM the roast, extra! You can't burn what's ALREADY ON FIRE! 💥🔥");
    }

    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    await message.reply(`${target}, ${roast} 💥`);
  },

  async slashExecute(interaction) {
    const target = interaction.options.getMember('user');

    if (!target) {
      return interaction.reply("That user isn't in the server. Can't roast a ghost, nerd.");
    }

    if (target.user.id === interaction.user.id) {
      const roast = selfRoasts[Math.floor(Math.random() * selfRoasts.length)];
      return interaction.reply(roast);
    }

    if (target.user.id === interaction.client.user.id) {
      return interaction.reply("You're trying to roast ME?! I AM the roast, extra! You can't burn what's ALREADY ON FIRE! 💥🔥");
    }

    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    await interaction.reply(`${target}, ${roast} 💥`);
  },
};