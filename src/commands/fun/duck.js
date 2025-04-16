const { ApplicationCommandOptionType } = require("discord.js");
module.exports = {
    name: "duck",
    description: "Ducky",
    category: "Fun",
    aliases: [],
    slash: true,
    legacy: true,
    devOnly: false,
    ownerOnly: false,
    execute : async ({ message, interaction }) => {
        const duckurl = `https://random-d.uk/api/v2/randomimg?t=${Date.now()}`;
        if (interaction) {
            await interaction.reply({content: duckurl});
        }
        if (message) {
            await message.reply({content: duckurl});
        }
    },
  };
