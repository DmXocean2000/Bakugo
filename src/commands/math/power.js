const { SlashCommandBuilder } = require('discord.js');

const insults = [
  "You really needed a bot to do this? Pathetic.",
  "Great, now you can brag about basic math. Congrats, nerd.",
  "Even Kaminari could’ve done this without frying his brain!",
  "Why stop there? Raise it to the power of FAILURE!",
  "I’m doing your math now?! What am I, a calculator with anger issues?",
  "My owner really paid for this VPS so I could witness this embarrassment?!",
  "You know, there are calculators for this, right?",
  "I can do something better than this. Like, literally anything else.",
  "That’s basic exponentiation! Did you eat your textbook?!",
  "The result’s right there. Try not to faint from the mental strain.",
  "Damn… even I’m getting secondhand embarrassment from your math. What the hell did they even teach you in school?!",
  "I don’t know who hits harder—your math skills or Shigaraki… and at least he’s accurate!",
];

module.exports = {
  name: 'exponent',
  description: 'Raises one number to the power of another.',
  category: 'Math',
  aliases: ['exponent', 'pow', 'power'],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,

  data: new SlashCommandBuilder()
    .setName('power')
    .setDescription('Raises a number to the power of another.')
    .addNumberOption(option =>
      option.setName('base')
        .setDescription('The base number')
        .setRequired(true)
    )
    .addNumberOption(option =>
      option.setName('exponent')
        .setDescription('The exponent')
        .setRequired(true)
    ),

  async execute({ message, args }) {
    const a = Number(args[0]);
    const b = Number(args[1]);

    if (isNaN(a) || isNaN(b)) {
      return message.reply("Did you just forget what a number is? Try again, extra. You're making me depressed!");
    }

    const result = Math.pow(a, b);
    const insult = insults[Math.floor(Math.random() * insults.length)];

    return message.reply(`Result: **${result}**! ${insult}`);
  },

  async slashExecute(interaction) {
    const a = interaction.options.getNumber('base');
    const b = interaction.options.getNumber('exponent');

    if (isNaN(a) || isNaN(b)) {
      return interaction.reply({
        content: "Did you just forget what a number is? Try again, extra. You're making me depressed!",
        ephemeral: true
      });
    }

    const result = Math.pow(a, b);
    const insult = insults[Math.floor(Math.random() * insults.length)];

    return interaction.reply(`Result: **${result}**! ${insult}`);
  }
};
