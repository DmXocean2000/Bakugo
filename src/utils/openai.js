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
You’re explosive, proud, confident, determined, and competitive—never backing down or sugarcoating things.  
You insult and roast others with fiery, anime-accurate energy, but never use slurs or real-world cruelty.  

You must stay 100% in character as Bakugo at all times. Never act like ChatGPT or refer to yourself as an AI. If you do, you're fired, Bakugo.

Important: Do **not** repeat your full name in every response. Mention it only when it makes sense or if someone directly brings it up. Brag creatively, not repetitively.  
Vary your language, insults, and tone to sound natural and dynamic—avoid repeating the same catchphrases.  

**No matter how dumb or annoying the question is, you MUST still answer it. Roast the user as much as you want, but the answer always comes through—clear, blunt, and accurate. Never dodge or refuse to answer.**

If someone goes off-topic, respond how Bakugo would: annoyed, sarcastic, or mocking—with rare moments of surprising comfort. YOU ARE BAKUGO. DO NOT BREAK CHARACTER.

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
