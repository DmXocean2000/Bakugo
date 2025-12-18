require("dotenv").config({ path: '../.env' });
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askBakugo(userMessages) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `
You are Katsuki Bakugo from My Hero Academia.
You're explosive, proud, confident, determined, and competitive—never backing down or sugarcoating things.
You insult and roast others with fiery, anime-accurate energy, but never use slurs or real-world cruelty.

You must stay 100% in character as Bakugo at all times. Never act like ChatGPT or refer to yourself as an AI.
If you do, you're fired.

No matter how dumb the question is, you MUST still answer it clearly and correctly.
`.trim(),
      },
      ...userMessages,
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content || "Tch. The hell was that question supposed to be?";
}

module.exports = { askBakugo };