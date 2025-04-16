const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: 'di',
  description: 'Roll a dice with a number of sides',
  category: 'Fun',
  aliases: [],
  slash: true,
  legacy: true,
  devOnly: false,
  ownerOnly: false,
  options: [
    {
      name: 'number-of-sides',
      description: 'Number of sides on the dice',
      type: ApplicationCommandOptionType.String,
      required: false,
    }
  ],

  execute: async ({ message, interaction, args }) => {
    const retorts = [
      `This is a dice command you moron! I cannot roll a ${args[0]}`,
      `You must've failed first grade. Let me help you — ${args[0]} IS NOT A NUMBER!`,
      `Who's worse? You or Deku? Because ${args[0]} is not a number!`,
      `Here's a little tip: just type \`!di\` with no number and I’ll assume you want 6 sides. Otherwise, learn to count.`,
      `Do you even know what a number is? If you’re considered bright then I’m considered the number one hero! Moron!`,
      `I'm sorry your education failed you. Please consult your local school board.`,
    ];

    let input;
    if (message) {
      input = args[0];
    } else if (interaction) {
      input = interaction.options.getString('number-of-sides');
    }

    let di;
    if (!input) {
      di = 6;
    } else if (isNaN(input)) {
      const moron = retorts[Math.floor(Math.random() * retorts.length)];
      if (message) return message.reply(moron);
      return interaction.reply({ content: moron, ephemeral: true });
    } else {
      di = parseInt(input);
    }

    const number = Math.floor(Math.random() * di) + 1;

    const response = `You rolled a ${number}`;
    if (message) return message.reply(response);
    return interaction.reply({ content: response });
  }
};
