const { SlashCommandBuilder } = require('discord.js');
const roastLines = [
    "You really needed help for that? Pathetic!",
    "I’ve seen rocks do math faster than you!",
    "Maybe next time you won’t waste my time, extra.",
    "You're lucky I'm here to carry your sorry ass.",
    "That’s basic addition! Did you eat your textbook?!",
    "The result’s right there. Try not to faint from the mental strain.",
    "Use a calculator next time, nerd!",
    "my owner pays for a VPS so I can witness this embarrassment?!",
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
  name: 'add',
  description: 'Adds numbers together',
  category: 'Math',
  aliases: ['add', 'sum', 'addition'],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  data: new SlashCommandBuilder()
    .setName('addition')
    .setDescription('Add up to 4 numbers together')
    .addNumberOption(option =>
      option.setName('1st-number')
        .setDescription('The first number to add')
        .setRequired(true)
    )
    .addNumberOption(option =>
      option.setName('2nd-number')
        .setDescription('The second number to add')
        .setRequired(true)
    )
    .addNumberOption(option =>
      option.setName('3rd-number')
        .setDescription('The third number to add')
        .setRequired(false)
    )
    .addNumberOption(option =>
      option.setName('4th-number')
        .setDescription('The fourth number to add')
        .setRequired(false)
    ),

  async execute({ message, args }) {
    //console.log('[DEBUG] Math args:', args);
    if (args.some(arg => isNaN(arg))) {
      return message.reply("Do you even know what a number is? If you're considered bright, then I’m the number one hero!");
    }

    const sum = args.reduce((acc, cur) => acc + Number(cur), 0);
    return message.reply(`result is **${sum}**! ${getRoast()}`);
  },

  async slashExecute(interaction) {
    const numbers = [
      interaction.options.getNumber('1st-number'),
      interaction.options.getNumber('2nd-number'),
      interaction.options.getNumber('3rd-number'),
      interaction.options.getNumber('4th-number')
    ].filter(n => typeof n === 'number');

    const sum = numbers.reduce((acc, cur) => acc + cur, 0);
    return interaction.reply(`result is **${sum}**! ${getRoast()}`);
  }
};
