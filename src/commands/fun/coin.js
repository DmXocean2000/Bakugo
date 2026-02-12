const { SlashCommandBuilder } = require('discord.js');

const headsResponses = [
  "💥 **HEADS!** I called it before you even flipped it, extra!",
  "💥 **HEADS!** Tch. Predictable.",
  "💥 **HEADS!** Just like my wins — always on top!",
  "💥 **HEADS!** The coin knows who's the best!",
  "💥 **HEADS!** Boom! Now what?!",
];

const tailsResponses = [
  "💥 **TAILS!** Tch. Whatever. It's still a flip!",
  "💥 **TAILS!** Don't look at me like that. The coin decided, not me!",
  "💥 **TAILS!** Even the coin wants to run away from you, EXTRA!",
  "💥 **TAILS!** I didn't rig it. ...This time.",
  "💥 **TAILS!** The coin has spoken! Deal with it!",
];

const edgeResponse = "💥 **IT LANDED ON THE EDGE?!** DEKUUUUUUUUUUUUUUU!!!! Tch. FLIP IT AGAIN!";

module.exports = {
  name: 'coinflip',
  description: 'Bakugo aggressively flips a coin.',
  category: 'Fun',
  aliases: ['flip', 'coin'],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  userPermissions: [],
  botPermissions: [],

  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Bakugo aggressively flips a coin.'),

  async execute({ message }) {
    const roll = Math.random();

    // 1% chance of landing on edge because chaos
    if (roll < 0.01) {
      return message.reply(edgeResponse);
    }

    const isHeads = roll < 0.505;
    const pool = isHeads ? headsResponses : tailsResponses;
    await message.reply(pool[Math.floor(Math.random() * pool.length)]);
  },

  async slashExecute(interaction) {
    const roll = Math.random();

    if (roll < 0.01) {
      return interaction.reply(edgeResponse);
    }

    const isHeads = roll < 0.505;
    const pool = isHeads ? headsResponses : tailsResponses;
    await interaction.reply(pool[Math.floor(Math.random() * pool.length)]);
  },
};