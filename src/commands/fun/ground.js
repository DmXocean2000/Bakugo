const { ApplicationCommandOptionType } = require("discord.js");

const immuneUsers = ['742486693008900166', '777205165353730048', '757077418891804775']; // DMX, Goddess, Shadow

module.exports = {
  name: "ground",
  aliases: ["grounded"],
  description: "Ground someone",
  category: "Fun",
  slash: true,
  legacy: true,
  devOnly: false,
  ownerOnly: false,

  options: [
    {
      name: 'user',
      description: 'The user you want to ground',
      required: true,
      type: ApplicationCommandOptionType.User,
    },
  ],

  execute: async ({ args, interaction, message }) => {
    let targetUser, authorId;

    // Get info from slash
    if (interaction) {
      targetUser = interaction.options.getUser('user');
      authorId = interaction.member.id;
    } 
    // Get info from legacy
    else if (message) {
      const mention = message.mentions.users.first();
      if (!mention) return message.reply("Tag a user to ground!");
      targetUser = mention;
      authorId = message.author.id;
    }

    const targetName = targetUser.username.toLowerCase();
    const targetId = targetUser.id;

    const specialNames = ['<@1037521249544446033>', 'bakugo', 'katsuki', 'kacchan'];

    const isSpecial = specialNames.includes(targetUser.username.toLowerCase()) || specialNames.includes(`<@${targetId}>`);

    const isImmune = immuneUsers.includes(authorId);

    let response = '';

    if (isSpecial) {
      if (isImmune) {
        response = 'I don’t wanna be grounded!';
      } else if (targetName === 'kacchan') {
        response = 'Nice try, Nerd! But you cannot fool me!';
      } else {
        response = 'You cannot ground me! I’m untouchable! GO TO HELL!';
      }
    } else {
      response = `${targetUser.username}, you have been grounded! Suffer in silence!`;
    }

    if (interaction) {
      return interaction.reply({ content: response });
    } else {
      return message.reply(response);
    }
  },
};
