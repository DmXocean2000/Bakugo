const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: "multiply",
  description: "Multiplies numbers together",
  category: "Math",
  legacy: true,
  slash: true,
  options: [
    {
      name: "1st-number",
      description: "The first number to multiply",
      required: true,
      type: ApplicationCommandOptionType.Number,
    },
    {
      name: "2nd-number",
      description: "The second number to multiply",
      required: true,
      type: ApplicationCommandOptionType.Number,
    },
    {
      name: "3rd-number",
      description: "The third number to multiply",
      required: false,
      type: ApplicationCommandOptionType.Number,
    },
    {
      name: "4th-number",
      description: "The fourth number to multiply",
      required: false,
      type: ApplicationCommandOptionType.Number,
    },
  ],

  async execute({ message, args }) {
    const numbers = args.map(Number);
    if (numbers.some(isNaN)) {
      return message.reply("How do you screw up multiplication? Go read a damn textbook.");
    }

    const product = numbers.reduce((acc, num) => acc * num, 1);
    const responses = [
      `Result: **${product}**! Are you finally getting this or just guessing?!`,
      `You got **${product}**. Good job... I guess.`,
      `**${product}**. Even Shigaraki could’ve figured that out.`,
      `You multiplied stuff. Wow. **${product}**. Want a medal?`,
      `**${product}**. Try doing that under pressure next time, extra.`,
      `Result: **${product}**! That wasn’t too hard, was it?!`,
      `**${product}**. Now don’t act like you're a genius.`,
      `**${product}**. Guess your math teacher didn’t totally fail.`,
      `You got **${product}**. Tch. Try that again without crying.`,
      `**${product}**. Hah! Bet you didn’t expect it to work.`,
      `**${product}**. You’re still not a hero, though.`,
      `**${product}**. Wow, you can multiply. What’s next? Division?`,
      `**${product}**. I’m impressed... not really.`,
      `**${product}**. You know, even a toddler could do this.`,
      `**${product}**. You’re still not getting a hero license.`,
      `**${product}**. I hope you’re not planning to use this in battle.`,
      `**${product}**. I’m sure you’ll forget this in two seconds.`,
      `**${product}**. Just don’t tell anyone you learned it from me.`,
    ];

    const random = Math.floor(Math.random() * responses.length);
    return message.reply(responses[random]);
  },

  async slashExecute(interaction) {
    const nums = [
      interaction.options.getNumber("1st-number"),
      interaction.options.getNumber("2nd-number"),
      interaction.options.getNumber("3rd-number"),
      interaction.options.getNumber("4th-number")
    ].filter(n => n !== null);

    const product = nums.reduce((acc, num) => acc * num, 1);
    const responses = [
      `Result: **${product}**! That wasn’t too hard, was it?!`,
      `**${product}**. Now don’t act like you're a genius.`,
      `**${product}**. Guess your math teacher didn’t totally fail.`,
      `You got **${product}**. Tch. Try that again without crying.`,
      `**${product}**. Hah! Bet you didn’t expect it to work.`,
      `**${product}**. You’re still not a hero, though.`,
      `**${product}**. Wow, you can multiply. What’s next? Division?`,
      `**${product}**. I’m impressed... not really.`,
      `**${product}**. You know, even a toddler could do this.`,
      `**${product}**. You’re still not getting a hero license.`,
      `**${product}**. I hope you’re not planning to use this in battle.`,
      `**${product}**. I’m sure you’ll forget this in two seconds.`,
      `**${product}**. Just don’t tell anyone you learned it from me.`,
      `**${product}**! Are you finally getting this or just guessing?!`,
      `You got **${product}**. Good job... I guess. wait I GOT IT!`,
      `**${product}**. Even Shigaraki could’ve figured that out.`,
      `You multiplied stuff. Wow. **${product}**. Want a medal?`,
      `**${product}**. Try doing that under pressure next time, extra.`,

    ];

    const random = Math.floor(Math.random() * responses.length);
    return interaction.reply(responses[random]);
  }
};
