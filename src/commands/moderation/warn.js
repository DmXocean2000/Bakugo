const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');
const logError = require('../../utils/logError');
const createModLog = require('../../utils/createModLog');

const responses = [
  "Consider this your WARNING, extra! Next time I won't be so nice! 💥",
  "Tch. You're on thin ice. One more screw-up and you're DONE!",
  "I'm being GENEROUS by only warning you. Don't push your luck!",
  "Strike one, loser! You really wanna find out what strike two looks like?",
  "You just earned yourself a warning. Congratulations, idiot!",
  "I'm watching you now. Step out of line again and BOOM!",
  "Warning issued. And trust me, you don't want the next step!",
];

function getRandomResponse() {
  return responses[Math.floor(Math.random() * responses.length)];
}

module.exports = {
  name: 'warn',
  description: 'Warn a user.',
  category: 'Moderation',
  aliases: [],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [],

  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user.')
    .addUserOption(opt =>
      opt.setName('user').setDescription('The user to warn').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('reason').setDescription('Reason for the warning').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute({ message, args }) {
    const target = message.mentions.members.first();
    if (!target) return message.reply("Tch. Mention someone to warn, idiot.");

    if (target.user.id === message.author.id) {
      return message.reply("You're trying to warn YOURSELF? Get some self-respect, extra!");
    }

    if (target.user.bot) {
      return message.reply("You can't warn a bot, dumbass. What's it gonna do, feel bad?");
    }

    if (target.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply("Tch. You can't warn someone with a role equal to or higher than yours, extra!");
    }

    const reason = args.slice(1).join(' ') || 'No reason given. Bakugo decided.';

    try {
      const entry = await createModLog({
        guild: message.guild,
        target: { id: target.user.id, tag: target.user.tag },
        moderator: { id: message.author.id, tag: message.author.tag },
        action: 'warn',
        reason,
        client: message.client,
      });

      // DM the user
      const dmEmbed = new EmbedBuilder()
        .setColor(0xFFFF00)
        .setTitle(`⚠️ Warning — ${message.guild.name}`)
        .addFields(
          { name: 'Reason', value: reason },
          { name: 'Moderator', value: message.author.tag },
          { name: 'Case #', value: `${entry.caseNumber}`, inline: true },
        )
        .setTimestamp();

      await target.user.send({ embeds: [dmEmbed] }).catch(() => null); // Silently fail if DMs are closed

      await message.reply(`${getRandomResponse()}\n**${target.user.tag}** has been warned. (Case #${entry.caseNumber}) Reason: *${reason}*`);
    } catch (err) {
      logError({ command: 'warn', error: err, context: { userTag: message.author.tag, targetTag: target.user.tag } });
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
      return interaction.reply({ content: "You're trying to warn YOURSELF? Get some self-respect, extra!", flags: MessageFlags.Ephemeral });
    }

    if (target.user.bot) {
      return interaction.reply({ content: "You can't warn a bot, dumbass. What's it gonna do, feel bad?", flags: MessageFlags.Ephemeral });
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: "Tch. You can't warn someone with a role equal to or higher than yours, extra!", flags: MessageFlags.Ephemeral });
    }

    try {
      const entry = await createModLog({
        guild: interaction.guild,
        target: { id: target.user.id, tag: target.user.tag },
        moderator: { id: interaction.user.id, tag: interaction.user.tag },
        action: 'warn',
        reason,
        client: interaction.client,
      });

      // DM the user
      const dmEmbed = new EmbedBuilder()
        .setColor(0xFFFF00)
        .setTitle(`⚠️ Warning — ${interaction.guild.name}`)
        .addFields(
          { name: 'Reason', value: reason },
          { name: 'Moderator', value: interaction.user.tag },
          { name: 'Case #', value: `${entry.caseNumber}`, inline: true },
        )
        .setTimestamp();

      await target.user.send({ embeds: [dmEmbed] }).catch(() => null);

      await interaction.reply(`${getRandomResponse()}\n**${target.user.tag}** has been warned. (Case #${entry.caseNumber}) Reason: *${reason}*`);
    } catch (err) {
      logError({ command: 'warn', error: err, context: { userTag: interaction.user.tag, targetTag: target.user.tag } });
      await interaction.reply({ content: "Something exploded. And not in the good way.", flags: MessageFlags.Ephemeral });
    }
  },
};