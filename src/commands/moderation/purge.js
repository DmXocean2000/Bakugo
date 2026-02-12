const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

const responses = [
  "Here I am, being the equivalent of a broom, cleaning your mess again.",
  "You know I'm not your damn janitor, right?",
  "Cleaning up after your sorry ass again, huh?",
  "I should charge you for this.",
  "You really need to clean up after yourself.",
  "This isn't kindergarten. You can't just throw your trash everywhere.",
  "You know, I could be doing something more productive than cleaning up your mess.",
  "You're lucky Ocean pays me to clean up after you.",
  "I do not get paid enough for this trash.",
  "Have you ever thought about *not* trashing the chat?",
  "This isn't Disney's Cinderella — I shouldn't have to clean up after you!",
  "I'm supposed to be the number one hero, NOT THE NUMBER ONE JANITOR!",
];

function getRandomResponse() {
  return responses[Math.floor(Math.random() * responses.length)];
}

module.exports = {
  name: 'purge',
  description: 'Delete a bunch of messages quickly!',
  category: 'Moderation',
  aliases: ['clear', 'prune'],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  userPermissions: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.ManageMessages],

  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete a bunch of messages quickly!')
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('Number of messages to delete (1-99)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(99)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute({ message, args }) {
    const rawAmount = parseInt(args[0], 10);

    if (isNaN(rawAmount) || rawAmount < 1 || rawAmount > 99) {
      return message.reply("Tch. Pick a number between 1 and 99, extra.");
    }

    try {
      // +1 to include the command message itself
      const deleted = await message.channel.bulkDelete(rawAmount + 1, true);

      if (rawAmount === 1) {
        const reply = await message.channel.send("You really went through all that trouble just to purge **one** puny message? You know you can shift+delete it, right?");
        setTimeout(() => reply.delete().catch(() => null), 5000);
      } else {
        const reply = await message.channel.send(`${getRandomResponse()} (${deleted.size - 1} messages deleted)`);
        setTimeout(() => reply.delete().catch(() => null), 5000);
      }

    } catch (error) {
      if (error.code === 50013) {
        return message.reply("Tch. I'm missing the Manage Messages permission, nerd.");
      } else if (error.code === 50034) {
        return message.reply("Those messages are ancient history. I can't delete them.");
      } else {
        console.error(error);
        return message.reply("Something exploded. And not in the good way.");
      }
    }
  },

  async slashExecute(interaction) {
    const amount = interaction.options.getInteger('amount');

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);

      if (amount === 1) {
        await interaction.reply({
          content: "You really went through all that trouble just to purge **one** puny message? You know you can shift+delete it, right?",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: `${getRandomResponse()} (${deleted.size} messages deleted)`,
          flags: MessageFlags.Ephemeral,
        });
      }

    } catch (error) {
      if (error.code === 50013) {
        return interaction.reply({ content: "Tch. I'm missing the Manage Messages permission, nerd.", flags: MessageFlags.Ephemeral });
      } else if (error.code === 50034) {
        return interaction.reply({ content: "Those messages are too old even for me to explode.", flags: MessageFlags.Ephemeral });
      } else {
        console.error(error);
        return interaction.reply({ content: "Something exploded. And not in the good way.", flags: MessageFlags.Ephemeral });
      }
    }
  },
};