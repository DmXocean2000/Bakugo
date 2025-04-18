const { askBakugo } = require('../utils/openai.js');
require('dotenv').config(); // Just in case
const { MessageFlags } = require('discord.js');
// You can put your Bakugo chat channel ID in your .env file
const bakugoChannelId = process.env.BAKUGO_CHANNEL_ID;
const conversationHistory = []; // For 20 message memory

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore bots
    if (message.channel.id !== bakugoChannelId) return; // Only in the correct channel

    const displayName = message.member?.displayName || message.author.username;
    const userMessage = `${displayName} says: ${message.content}`;

    conversationHistory.push({ role: 'user', content: userMessage });

    if (conversationHistory.length > 20) {
      conversationHistory.shift(); // Keep memory to 20
    }

    try {
      const reply = await askBakugo(conversationHistory);
      conversationHistory.push({ role: 'assistant', content: reply });

      if (conversationHistory.length > 20) {
        conversationHistory.shift(); // Keep memory to 20
      }

      await message.channel.send(reply);
    } catch (error) {
      console.error('Error in passiveListener:', error);
      await message.channel.send({
        content: 'Tch. Something exploded when I tried to answer, extra.',
        flags: MessageFlags.Ephemeral
      });
    }
  });
};