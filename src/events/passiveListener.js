// src/events/passiveListener.js (or wherever you're placing it)

const { askBakugo } = require('../utils/openai.js');
require('dotenv').config(); // Just in case

// You can put your Bakugo chat channel ID in your .env file
const bakugoChannelId = process.env.BAKUGO_CHANNEL_ID;

const conversationHistory = [];

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (message.channel.id !== bakugoChannelId) return;

    try {
      //console.log(`[Bakugo Passive] Heard: ${message.content}`);

      // Add user's message to history
      conversationHistory.push({
        role: "user",
        content: message.content
      });

      // Keep only last 20 messages
      if (conversationHistory.length > 20) {
        conversationHistory.shift();
      }

      // Ask Bakugo
      const reply = await askBakugo(conversationHistory);

      // Send Bakugo's reply
      await message.channel.send(reply);

      // Add Bakugo's reply to history too
      conversationHistory.push({
        role: "assistant",
        content: reply
      });

      // Again, trim to 20
      if (conversationHistory.length > 20) {
        conversationHistory.shift();
      }

    } catch (err) {
      console.error(`[Bakugo Passive Listener Error]:`, err);
    }
  });
};
