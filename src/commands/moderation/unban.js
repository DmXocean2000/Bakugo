const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logError = require('../../utils/logError');
const createModLog = require('../../utils/createModLog');

const responses = [
  "Fine. You get ONE more chance. Don't waste it!",
  "Tch. I'm feeling generous today. You're back in.",
  "Someone begged hard enough. You're unbanned. Don't make me regret it.",
  "Against my better judgment, you're allowed back. Step out of line and you're DONE!",
  "Consider this your resurrection arc. Don't blow it, extra!",
];

function getRandomResponse() {
  return responses[Math.floor(Math.random() * responses.length)];
}

module.exports = {
  name: 'unban',
  description: 'Unban a user from the server.',
  category: 'Moderation',
  aliases: [],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  userPermissions: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],

  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server.')
    .addStringOption(opt =>
      opt.setName('userid').setDescription('The user ID to unban').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for the unban').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute({ message, args }) {
    const userId = args[0]?.replace(/[<@!>]/g, '');
    if (!userId) return message.reply("Tch. Give me a user ID to unban, extra.");

    const reason = args.slice(1).join(' ') || 'No reason given. Bakugo felt merciful.';

    try {
      const banList = await message.guild.bans.fetch();
      const bannedUser = banList.get(userId);

      if (!bannedUser) {
        return message.reply("That user isn't even banned. What are you doing?");
      }

      await message.guild.members.unban(userId, reason);
      await createModLog({
        guild: message.guild,
        target: { id: bannedUser.user.id, tag: bannedUser.user.tag },
        moderator: { id: message.author.id, tag: message.author.tag },
        action: 'unban',
        reason,
        client: message.client,
      });
      await message.reply(`${getRandomResponse()}\n**${bannedUser.user.tag}** has been unbanned. Reason: *${reason}*`);
    } catch (err) {
      logError({ command: 'unban', error: err, context: { userTag: message.author.tag, targetId: userId } });
      await message.reply("Something exploded. And not in the good way.");
    }
  },

  async slashExecute(interaction) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'No reason given. Bakugo felt merciful.';

    try {
      const banList = await interaction.guild.bans.fetch();
      const bannedUser = banList.get(userId);

      if (!bannedUser) {
        return interaction.reply({ content: "That user isn't even banned. What are you doing?", flags: MessageFlags.Ephemeral });
      }

      await interaction.guild.members.unban(userId, reason);
      await createModLog({
        guild: interaction.guild,
        target: { id: bannedUser.user.id, tag: bannedUser.user.tag },
        moderator: { id: interaction.user.id, tag: interaction.user.tag },
        action: 'unban',
        reason,
        client: interaction.client,
      });
      await interaction.reply(`${getRandomResponse()}\n**${bannedUser.user.tag}** has been unbanned. Reason: *${reason}*`);
    } catch (err) {
      logError({ command: 'unban', error: err, context: { userTag: interaction.user.tag, targetId: userId } });
      await interaction.reply({ content: "Something exploded. And not in the good way.", flags: MessageFlags.Ephemeral });
    }
  },
};