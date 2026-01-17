const { ApplicationCommandOptionType } = require("discord.js");
const { MessageFlags } = require('discord.js');
//const { aliases } = require("./addition");
module.exports = {
  name: "divide",
  description: "Divides numbers. Try not to divide by zero, idiot.",
  category: "Math",
  legacy: true,
  slash: true,
  aliases: ["div", "division"],
  options: [
    {
      name: "dividend",
      description: "The number to be divided",
      required: true,
      type: ApplicationCommandOptionType.Number,
    },
    {
      name: "divisor",
      description: "The number to divide by",
      required: true,
      type: ApplicationCommandOptionType.Number,
    }
  ],

  async execute({ message, args }) {
    const [a, b] = args.map(Number);
    if (isNaN(a) || isNaN(b)) {
      return message.reply("Tch. Those aren’t numbers! You trying to crash me?!");
    }

    if (b === 0) {
      return message.reply("The only thing you're dividing is my patience. GO AWAY EXTRA!");
    }

    const result = a / b;
    const responses = [
      `Result: **${result}**. Congratulations, you can do basic division.`,
      `**${result}**. You want a sticker for that?`,
      `That’s **${result}**. Don’t get cocky!`,
      `**${result}**. At least you didn’t divide by zero. Barely a win.`,
      `**${result}**. Good. Now do it again. Faster. Or I explode you.`,
      `Result: **${result}**. Bet you thought you’d break something.`,
      `**${result}**. Math is easy when you're not stupid.`,
      `You got **${result}**. Even Dabi could've done that.`,
      `**${result}**. You survived... *barely.*`,
      `**${result}**. Try harder next time, extra.`,
    ];
    const random = Math.floor(Math.random() * responses.length);
    return message.reply(responses[random]);
  },

  async slashExecute(interaction) {
    const a = interaction.options.getNumber("dividend");
    const b = interaction.options.getNumber("divisor");

    if (b === 0) {
      return interaction.reply({
        content: "You seriously tried to divide by ZERO?! Go to jail.",
        flags: MessageFlags.Ephemeral
      });
    }

    const result = a / b;
    const responses = [
      `Result: **${result}**. Bet you thought you’d break something.`,
      `**${result}**. Math is easy when you're not stupid.`,
      `You got **${result}**. Even Dabi could've done that.`,
      `**${result}**. You survived... *barely.*`,
      `**${result}**. Try harder next time, extra.`,
      `Result: **${result}**. Congratulations, you can do basic division.`,
      `**${result}**. You want a sticker for that?`,
      `That’s **${result}**. Don’t get cocky!`,
      `**${result}**. At least you didn’t divide by zero. Barely a win.`,
      `**${result}**. Good. Now do it again. Faster. Or I explode you.`,
    ];
    const random = Math.floor(Math.random() * responses.length);
    return interaction.reply(responses[random]);
  }
};
