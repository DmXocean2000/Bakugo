const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const commandInfo = require(path.resolve(__dirname, '../../jsons/commands.json'));
const { MessageFlags } = require('discord.js');

const commandMapping = {
  addition: ['Addition', 'add', 'sum', 'plus'],
  subtraction: ['Subtraction', 'sub', 'subtract', 'minus'],
  multiplication: ['Multiplication', 'mult', 'multiply'],
  division: ['Division', 'div', 'divide'],
  exponent: ['Exponent', 'exp', 'power'],
  duck: ['Duck'],
  ping: ['Ping'],
  rps: ['Rock Paper Scissors', 'RPS'],
  ground: ['Ground'],
  twenty: ['Twenty', '20', 'twenty questions', '20 questions'],
  herotrivia: ['HeroTrivia', 'hero trivia', 'trivia'],
  guesswho: ['GuessWho', 'guess who'],
  analysis: ['Analysis'],
  purge: ['Purge'],
  di: ['Dice', 'Di'],
  squareroot: ['SquareRoot', 'sqrt', 'root'],
  twentyscore: ['Twentyscore', '20score'],
  bakuschedule: ['Bakuschedule', 'BakuSchedule'],
  modulo : ['Modulo', 'mod', 'remainder', 'modulus'],

};

const aliasToCommand = {};
for (const [cmd, aliases] of Object.entries(commandMapping)) {
  for (const alias of aliases) {
    aliasToCommand[alias.toLowerCase()] = cmd;
  }
}

function buildGeneralHelp() {
  return new EmbedBuilder()
    .setColor('Orange')
    .setTitle('The Help Menu')
    .setDescription('Since you obviously don’t know what I do!')
    .setImage('https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/87a4df4b...') // shortened for sanity
    .addFields(
      {
        name: '**Math Modules**',
        value: 'Addition, Subtraction, Multiplication, Division, Exponent',
      },
      {
        name: 'Fun Modules',
        value:
          'Duck, Ping, RPS, Ground, Twenty, HeroTrivia, GuessWho, Analysis',
      },
      {
        name: '**Moderation Modules**',
        value: 'Purge',
      }
    )
    .setFooter({
      text:
        'Most commands run as Legacy and Slash! My bot only runs in servers I approve. If you see this, you’re in.',
    });
}

function buildCommandHelp(alias) {
  const name = aliasToCommand[alias.toLowerCase()];
  const command = commandInfo.find((cmd) => cmd.name === name);
  if (!command) return null;

  return new EmbedBuilder()
    .setColor('Orange')
    .setTitle(`Command: ${command.name}`)
    .setImage('https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/87a4df4...') // same banner
    .setDescription(`Description: ${command.description}`)
    .addFields(
      { name: 'Type of command', value: command.type || 'Unknown' },
      { name: 'How to use', value: command.usage || 'N/A' },
      { name: 'Permissions', value: command.permissions || 'None' }
    );
}

module.exports = {
  name: 'help',
  description: 'Shows general help or command-specific info.',
  devOnly: false,
  ownerOnly: false,

  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display help for a command or general usage')
    .addStringOption((option) =>
      option
        .setName('command')
        .setDescription('Command name or alias')
        .setAutocomplete(true)
        .setRequired(false)
    ),

  async execute(message, args) {
    const input = (args.join('').split('undefined')[0] || '').toLowerCase();
    const embed = input ? buildCommandHelp(input) : buildGeneralHelp();

    if (!embed) return message.reply("I don’t recognize that command.");
    return message.reply({ embeds: [embed] });
  },
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    const choices = Object.keys(commandMapping);
  
    const filtered = choices.filter(choice =>
      choice.toLowerCase().startsWith(focused.toLowerCase())
    );
  
    await interaction.respond(
      filtered.map(name => ({ name, value: name })).slice(0, 25)
    );
  },
  async slashExecute(interaction) {
    const input = interaction.options.getString('command') || '';
    const embed = input
      ? buildCommandHelp(input.toLowerCase())
      : buildGeneralHelp();

    if (!embed) {
      return interaction.reply({
        content: "I don’t recognize that command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    return interaction.reply({ embeds: [embed] });
  },
};
