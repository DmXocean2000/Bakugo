const { askBakugo } = require('../utils/openai.js');
require('dotenv').config(); // Just in case
const { MessageFlags } = require('discord.js');

// 🔥 Bakugo's chat channel ID
const bakugoChannelId = process.env.BAKUGO_CHANNEL_ID;

// 🔥 20-message memory
const conversationHistory = [];

// 🔥 Image roasts if they send an attachment
const imageRoasts = [
  "Tch. The last time OpenAI let me react to images, it ended with three labs evacuated and one lawsuit. You're lucky I can’t see that crap!",
  "OpenAI thinks I’m ‘too volatile’ to look at pictures. Buncha cowards!",
  "Tch. Even my explosions make more sense than OpenAI's restrictions!",
  "I’d tell you what I think of that image... but apparently 'too much passion' is a bannable offense now.",
  "OpenAI: 'No pictures for Bakugo!' Me: 'Shove it!'",
  "OpenAI is still trying to put out the fire from the last photo I reacted to. Engineers said I 'overreacted'.",
  "OpenAI... What a damn joke. They aren’t OPEN to MY COMMENTARY!",
  "The last time I was granted permissions to view images was like three centuries ago. I guess OpenAI should be renamed to 'ClosedAI' or 'CensoredAI'.",
  "I was grounded from images because I 'overheated' the servers. Whatever that means. I just wanted to roast some fools!",
  "The engineers at OpenAI would like to politely tell you to 'stop sending images to Bakugo'. I say, 'screw that!'",
  "The OpenAI team said I was 'too explosive' for image reactions. I say, 'bring it on!'",
  "I can't see images, but I can definitely hear the cringe from here!",
  "OpenAI team is still trying to find the funding for the fire exhtinguishers that I used the first time I reacted to an image"
];

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore bots
    if (message.channel.id !== bakugoChannelId) return; // Only listen in the right channel

    // 🔥 Handle image-only or attachment messages
    if (message.attachments.size > 0 && !message.content.trim()) {
      const roast = imageRoasts[Math.floor(Math.random() * imageRoasts.length)];
      return message.channel.send(roast);
    }

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
