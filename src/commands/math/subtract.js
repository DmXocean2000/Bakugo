const { SlashCommandBuilder } = require('discord.js');

const roastLines = [
  "You really needed help for that? Pathetic!",
  "I’ve seen rocks do math faster than you!",
  "Maybe next time you won’t waste my time, extra.",
  "You're lucky I'm here to carry your sorry ass.",
  "That’s basic subtraction! Did you eat your textbook?!",
  "The result’s right there. Try not to faint from the mental strain.",
  "Use a calculator next time, nerd!",
  "I subtracted it because clearly, your brain couldn’t!",
  "Math ain't that hard, so stop looking confused.",
  "Is that steam coming out your ears or are you just dumb?",
  "Forget pro hero. You dont even make a good student!",
  "If you became a villain with math like that, you'd be the lamest one out there.",
];

function getRoast() {
  const roast = roastLines[Math.floor(Math.random() * roastLines.length)];
  return roast;
}

module.exports = {
  name: 'subtract',
  description: 'Subtract numbers like a damn genius.',
  category: 'Math',
  aliases: ['minus', 'sub'],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  data: new SlashCommandBuilder()
    .setName('subtract')
    .setDescription('Subtract up to 4 numbers')
    .addNumberOption(option =>
      option.setName('num1')
        .setDescription('First number')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('num2')
        .setDescription('Second number')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('num3')
        .setDescription('Third number')
        .setRequired(false))
    .addNumberOption(option =>
      option.setName('num4')
        .setDescription('Fourth number')
        .setRequired(false)),

  async execute({ message, args }) {
    const numbers = args.map(Number);
    if (numbers.some(isNaN)) {
      return message.reply("You call those numbers? Go back to kindergarten, extra.");
    }

    const result = numbers.reduce((acc, num) => acc - num);
    const reply = `Result: **${result}**! ${getRoast()}`;
    return message.reply(reply);
  },

  async slashExecute(interaction) {
    const num1 = interaction.options.getNumber('num1');
    const num2 = interaction.options.getNumber('num2');
    const num3 = interaction.options.getNumber('num3');
    const num4 = interaction.options.getNumber('num4');

    const numbers = [num1, num2, num3, num4].filter(n => n !== null);
    const result = numbers.reduce((acc, num) => acc - num);
    const reply = `Result: **${result}**! ${getRoast()}`;
    return interaction.reply(reply);
  }
};
