const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "root",
  description: "Find the nth root of a number.",
  category: "Math",
  legacy: true,
  slash: true,
  options: [
    {
      name: "base",
      description: "The number you want to root",
      type: 10, // ApplicationCommandOptionType.Number
      required: true,
    },
    {
      name: "degree",
      description: "The root degree (e.g. 2 = square root, 3 = cube root)",
      type: 10, // ApplicationCommandOptionType.Number
      required: true,
    },
  ],

  async execute({ message, args }) {
    const base = parseFloat(args[0]);
    const degree = parseFloat(args[1]);

    if (isNaN(base) || isNaN(degree) || degree === 0) {
      return message.reply(
        "Are you TRYING to make my brain explode? Numbers only. And not zero, DEKU!"
      );
    }

    if (base < 0 && degree % 2 === 0) {
      return message.reply(
        "You can't even root a negative with an even degree! What is this? Math hell?"
      );
    }

    const result = Math.pow(base, 1 / degree).toFixed(4);

    const roastReplies = [
      `**${result}**. I could’ve rooted that in my sleep.`,
      `That's **${result}**. Stop looking so proud.`,
      `Rooted it down to **${result}**. You're still dumb though.`,
      `You needed help with this? Root of **${base}** to the **${degree}**... It’s **${result}**, nerd.`,
      `**${result}**. Not bad. For someone with half a brain.`,
      `**${result}**. You needed ME to do that? Try harder.`,
      `That's **${result}**. Hope you remember it when you're failing the test.`,
      `Rooted: **${result}**. Still not rooting for YOU though.`,
      `**${result}**. My explosions make more sense than your math attempts.`,
      `You punched in **${base}**, wanted the **${degree}**th root. Got: **${result}**. Congrats? Not really.`,
      `You make me want to root for you, but I can't. **${result}**.`,
      `**${result}**. You’re still not a hero, but at least you can have me do math.`,
    ];

    return message.reply(
      roastReplies[Math.floor(Math.random() * roastReplies.length)]
    );
  },

  async slashExecute(interaction) {
    const base = interaction.options.getNumber("base");
    const degree = interaction.options.getNumber("degree");

    if (degree === 0 || isNaN(base) || isNaN(degree)) {
      return interaction.reply({
        content: "Zero? Really? You’re trying to divide by nothing now?!",
        ephemeral: true,
      });
    }

    if (base < 0 && degree % 2 === 0) {
      return interaction.reply({
        content:
          "Even root of a negative? You want imaginary numbers next? Go to math jail.",
        ephemeral: true,
      });
    }

    const result = Math.pow(base, 1 / degree).toFixed(4);

    const roastReplies = [
      `**${result}**. You needed ME to do that? Try harder.`,
      `That's **${result}**. Hope you remember it when you're failing the test.`,
      `Rooted: **${result}**. Still not rooting for YOU though.`,
      `**${result}**. My explosions make more sense than your math attempts.`,
      `You punched in **${base}**, wanted the **${degree}**th root. Got: **${result}**. Congrats? Not really.`,
      `You make me want to root for you, but I can't. **${result}**.`,
      `**${result}**. You’re still not a hero, but at least you can have me do math.`,
      `**${result}**. I could’ve rooted that in my sleep.`,
      `That's **${result}**. Stop looking so proud.`,
      `Rooted it down to **${result}**. You're still dumb though.`,
      `You needed help with this? Root of **${base}** to the **${degree}**... It’s **${result}**, nerd.`,
      `**${result}**. Not bad. For someone with half a brain.`,

    ];
    return interaction.reply(
      roastReplies[Math.floor(Math.random() * roastReplies.length)]
    );
  },
};
