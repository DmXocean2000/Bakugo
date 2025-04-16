const fetch = require('node-fetch'); // assuming you're using node-fetch v2

module.exports = {
  name: "dog",
  description: "Doggy!!!!",
  category: "Fun",
  aliases: [],
  slash: true,
  legacy: true,
  devOnly: false,
  ownerOnly: false,
  options: [
    {
      name: 'breed',
      description: 'The breed of the dog you want to see',
      required: false,
      type: 3, // STRING
    }
  ],

  execute: async ({ message, interaction, args }) => {
    let breed = null;

    if (interaction) {
      breed = interaction.options?.getString?.('breed');
    } else if (message) {
      breed = args.join('').toLowerCase();
    }

    try {
      let url = "https://dog.ceo/api/breeds/image/random";
      if (breed) {
        url = `https://dog.ceo/api/breed/${breed}/images/random`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'success') {
        const errorMsg = breed
          ? `Breed "${breed}" not found. Try something like "husky", "beagle", or "shiba".`
          : `Something went wrong. Try again later.`;

        if (interaction) {
          return interaction.reply({ content: errorMsg, ephemeral: true });
        } else if (message) {
          return message.reply(errorMsg);
        }
        return;
      }

      // ✅ ONLY SEND ONE MESSAGE
      const reply = { content: data.message };
      if (interaction) {
        return interaction.reply(reply);
      } else if (message) {
        return message.reply(reply);
      }

    } catch (err) {
      console.error("Dog command error:", err);
      const failMsg = "Could not fetch a dog image right now.";

      if (interaction) {
        return interaction.reply({ content: failMsg, ephemeral: true });
      } else if (message) {
        return message.reply(failMsg);
      }
    }
  },
};
