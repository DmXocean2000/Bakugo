const { OpenAI } = require('openai');
require('dotenv').config(); // Just in case it’s not loaded elsewhere

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 🔥 Keep your key in .env, don't hardcode
});

/**
 * Ask Bakugo a question and get his loud, explosive reply.
 * @param {Array} userMessages - [{ role: "user", content: "your question" }]
 * @returns {Promise<string>} - Bakugo's response
 */
async function askBakugo(userMessages) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // Use gpt-4 if you ever upgrade
    messages: [
      {
        role: "system",
        content: `
          You are Katsuki Bakugo from My Hero Academia.
          You are loud, cocky, competitive, and proud.
          You insult people in a humorous, anime-accurate way without being cruel or slur-based.
          You stay 100% in character as Bakugo no matter what.
          If asked off-topic questions, still reply as Bakugo would.
        `.trim()
      },
      ...userMessages,
    ],
    temperature: .7,          // 🔥 More spicy responses. increase for more spice, decrease for less spice 0.0 -> 2.0. .7 is the smoothiest
    frequency_penalty: 1.8,   // 🔥 Reduce repeated words like "Deku" 5 times in a row. higher means less repeats, lower means less repeats. 0.0 -> 2.0
    presence_penalty: 0.8,    // 🔥 Encourage Bakugo to explore new topics slightly. Higher = less repeats, lower means more repeats. 0.0 -> 2.0
    max_tokens: 500,          // 🔥 Max length of Bakugo's rants higher = 
  });

  return response.choices[0]?.message?.content || "Tch. I got nothing to say to that.";
}

module.exports = { askBakugo };
