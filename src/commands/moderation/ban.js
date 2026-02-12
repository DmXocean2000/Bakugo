const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logError = require('../../utils/logError');

const responses = [
  "GET OUT OF HERE, EXTRA! 💥",
  "You're done. Pack your bags and get lost!",
  "Tch. Should've behaved. Now you're GONE!",
  "Another loser bites the dust. GOOD RIDDANCE!",
  "I just took out the trash. You're welcome.",
  "Banned! And don't even THINK about coming back!",
  "That's what happens when you piss me off. BEGONE!",
];

function getRandomResponse() {
  return responses[Math.floor(Math.random() * responses.length)];
}

module.exports = {
  name: 'ban',
  description: 'Ban a user from the server.',
  category: 'Moderation',
  aliases: [],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  userPermissions: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],

  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server.')
    .addUserOption(opt =>
      opt.setName('user').setDescription('The user to ban').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for the ban').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute({ message, args }) {
    const target = message.mentions.members.first();
    if (!target) return message.reply("Tch. Mention someone to ban, idiot.");

    if (!target.bannable) {
      return message.reply("I can't ban that person. They're either above me or protected. Tch.");
    }

    const reason = args.slice(1).join(' ') || 'No reason given. Bakugo decided.';

    try {
      await target.ban({ reason });
      await message.reply(`${getRandomResponse()}\n**${target.user.tag}** has been banned. Reason: *${reason}*`);
    } catch (err) {
      logError({ command: 'ban', error: err, context: { userTag: message.author.tag, targetTag: target.user.tag } });
      await message.reply("Something exploded. And not in the good way.");
    }
  },

  async slashExecute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason given. Bakugo decided.';

    if (!target) {
      return interaction.reply({ content: "That user isn't in the server, nerd.", flags: MessageFlags.Ephemeral });
    }

    if (!target.bannable) {
      return interaction.reply({ content: "I can't ban that person. They're either above me or protected. Tch.", flags: MessageFlags.Ephemeral });
    }

    try {
      await target.ban({ reason });
      await interaction.reply(`${getRandomResponse()}\n**${target.user.tag}** has been banned. Reason: *${reason}*`);
    } catch (err) {
      logError({ command: 'ban', error: err, context: { userTag: interaction.user.tag, targetTag: target.user.tag } });
      await interaction.reply({ content: "Something exploded. And not in the good way.", flags: MessageFlags.Ephemeral });
    }
  },
};