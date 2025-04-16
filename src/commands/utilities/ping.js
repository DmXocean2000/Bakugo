const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Replies with Pong!',
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),

  async execute(message, args) {
    await message.reply('Pong!');
  },

  async slashExecute(interaction) {
    const ping = interaction.client.ws.ping;
    await interaction.reply(`Pong! Latency: ${ping}ms`);
  }
};
