const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logError = require('../../utils/logError');
const createModLog = require('../../utils/createModLog');

const responses = [
  "Fine! You can talk again. Don't make me regret it!",
  "Tch. Your sentence is up. Behave this time, extra!",
  "Alright, you've done your time. One more slip and you're DONE!",
  "I'm letting you out early. Consider it charity!",
  "Timeout's over. Try not to be annoying for five seconds!",
];

function getRandomResponse() {
  return responses[Math.floor(Math.random() * responses.length)];
}

module.exports = {
  name: 'untimeout',
  description: 'Remove a timeout from a user.',
  category: 'Moderation',
  aliases: ['unmute'],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],

  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Remove a timeout from a user.')
    .addUserOption(opt =>
      opt.setName('user').setDescription('The user to untimeout').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for removing the timeout').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute({ message, args }) {
    const target = message.mentions.members.first();
    if (!target) return message.reply("Tch. Mention someone to untimeout, idiot.");

    if (!target.isCommunicationDisabled()) {
      return message.reply("That person isn't even timed out. What are you doing?");
    }

    if (!target.moderatable) {
      return message.reply("I can't modify that person. They're either above me or protected. Tch.");
    }

    const reason = args.slice(1).join(' ') || 'No reason given. Bakugo felt merciful.';

    try {
      await target.timeout(null, reason);
      await createModLog({
        guild: message.guild,
        target: { id: target.user.id, tag: target.user.tag },
        moderator: { id: message.author.id, tag: message.author.tag },
        action: 'untimeout',
        reason,
        client: message.client,
      });
      await message.reply(`${getRandomResponse()}\n**${target.user.tag}** has been removed from timeout. Reason: *${reason}*`);
    } catch (err) {
      logError({ command: 'untimeout', error: err, context: { userTag: message.author.tag, targetTag: target.user.tag } });
      await message.reply("Something exploded. And not in the good way.");
    }
  },

  async slashExecute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason given. Bakugo felt merciful.';

    if (!target) {
      return interaction.reply({ content: "That user isn't in the server, nerd.", flags: MessageFlags.Ephemeral });
    }

    if (!target.isCommunicationDisabled()) {
      return interaction.reply({ content: "That person isn't even timed out. What are you doing?", flags: MessageFlags.Ephemeral });
    }

    if (!target.moderatable) {
      return interaction.reply({ content: "I can't modify that person. They're either above me or protected. Tch.", flags: MessageFlags.Ephemeral });
    }

    try {
      await target.timeout(null, reason);
      await createModLog({
        guild: interaction.guild,
        target: { id: target.user.id, tag: target.user.tag },
        moderator: { id: interaction.user.id, tag: interaction.user.tag },
        action: 'untimeout',
        reason,
        client: interaction.client,
      });
      await interaction.reply(`${getRandomResponse()}\n**${target.user.tag}** has been removed from timeout. Reason: *${reason}*`);
    } catch (err) {
      logError({ command: 'untimeout', error: err, context: { userTag: interaction.user.tag, targetTag: target.user.tag } });
      await interaction.reply({ content: "Something exploded. And not in the good way.", flags: MessageFlags.Ephemeral });
    }
  },
};