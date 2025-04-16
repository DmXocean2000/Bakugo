const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'modulo',
  description: 'Calculates the remainder of dividing two numbers.',
  category: 'Math',
  aliases: ['mod', 'remainder', 'modulus'],
  legacy: true,
  slash: true,
  ownerOnly: false,
  devOnly: false,
  data: new SlashCommandBuilder()
    .setName('modulo')
    .setDescription('Get the remainder from dividing two numbers')
    .addNumberOption(option =>
      option.setName('a')
        .setDescription('The dividend')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('b')
        .setDescription('The divisor')
        .setRequired(true)),

  async execute({ message, args }) {
    const a = Number(args[0]);
    const b = Number(args[1]);

    if (isNaN(a) || isNaN(b)) {
      return message.reply("Tch. Did you just throw letters at me? Give me *numbers*, extra.");
    }

    if (b === 0) {
      return message.reply("You can't divide by zero, moron! Even Deku knows that!");
    }

    const result = a % b;
    const insults = [
      `Result: **${result}**! That’s what you get when you don’t listen in math class!`,
      `The remainder is **${result}**. Bet you thought it’d be something cooler, huh?`,
      `**${result}**. That's the sad little scrap left behind. Just like your math skills.`,
      `It's **${result}**. Try again when you're not using brain cells from a goldfish.`,
      `You got **${result}**. Even I could do that in my sleep.`,
      `**${result}**. You call that math? I call it a tragedy.`,
      `**${result}**. You sure you’re not just guessing?`,
      `**${result}**. I’d say you’re lucky, but that’s just sad.`,
      `**${result}**. You're cheating on your test huh?`,
      `**${result}**. CS major? You just majored in *embarrassment*`,
      `**${result}**. You call that computing? Even Kaminari does better after a short circuit.`,
    ];

    const response = insults[Math.floor(Math.random() * insults.length)];
    return message.reply(response);
  },

  async slashExecute(interaction) {
    const a = interaction.options.getNumber('a');
    const b = interaction.options.getNumber('b');

    if (b === 0) {
      return interaction.reply({
        content: "You can't divide by zero, moron! Even Deku knows that!",
        ephemeral: true
      });
    }

    const result = a % b;
    const insults = [
      `Result: **${result}**! That’s what you get when you don’t listen in math class!`,
      `The remainder is **${result}**. Bet you thought it’d be something cooler, huh?`,
      `**${result}**. That's the sad little scrap left behind. Just like your math skills.`,
      `It's **${result}**. Try again when you're not using brain cells from a goldfish.`,
      `You got **${result}**. Even I could do that in my sleep.`,
      `**${result}**. You call that math? I call it a tragedy.`,
      `**${result}**. You sure you’re not just guessing?`,
      `**${result}**. I’d say you’re lucky, but that’s just sad.`,
      `**${result}**. You're cheating on your test huh?`,
      `**${result}**. CS major? You just majored in *embarrassment*`,
      `**${result}**. You call that computing? Even Kaminari does better after a short circuit.`,
    ];

    const response = insults[Math.floor(Math.random() * insults.length)];
    return interaction.reply(response);
  }
};
