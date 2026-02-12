const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logError = require('../../utils/logError');
const createModLog = require('../../utils/createModLog');
const resolveTarget = require('../../utils/resolveTarget');

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
    const target = await resolveTarget(message.guild, args[0]);
    if (!target) return message.reply("Tch. Give me a valid mention or user ID, idiot.");

    if (target.user.id === message.author.id) {
      return message.reply("You are trying to ban yourself right now. Good hell can I roll my eyes? I already did!");
    }

    if (!target.bannable) {
      return message.reply("I can't ban that person. They're either above me or protected within the discord world. Tch. What a joke.");
    }

    const reason = args.slice(1).join(' ') || 'No reason given. Bakugo decided.';

    try {
      await target.ban({ reason });
      await createModLog({
        guild: message.guild,
        target: { id: target.user.id, tag: target.user.tag },
        moderator: { id: message.author.id, tag: message.author.tag },
        action: 'ban',
        reason,
        client: message.client,
      });
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

    if (target.user.id === interaction.user.id) {
      return interaction.reply({ content: "You are trying to ban yourself right now. Good hell can I roll my eyes? I already did!", flags: MessageFlags.Ephemeral });
    }

    if (!target.bannable) {
      return interaction.reply({ content: "I can't ban that person. They're either above me or protected within the discord world. Tch. What a joke.", flags: MessageFlags.Ephemeral });
    }

    try {
      await target.ban({ reason });
      await createModLog({
        guild: interaction.guild,
        target: { id: target.user.id, tag: target.user.tag },
        moderator: { id: interaction.user.id, tag: interaction.user.tag },
        action: 'ban',
        reason,
        client: interaction.client,
      });
      await interaction.reply(`${getRandomResponse()}\n**${target.user.tag}** has been banned. Reason: *${reason}*`);
    } catch (err) {
      logError({ command: 'ban', error: err, context: { userTag: interaction.user.tag, targetTag: target.user.tag } });
      await interaction.reply({ content: "Something exploded. And not in the good way.", flags: MessageFlags.Ephemeral });
    }
  },
};