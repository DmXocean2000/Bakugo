const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ChannelType } = require('discord.js');
const GuildSettings = require('../../models/guildSettings')
const logError = require('../../utils/logError');

module.exports = {
  name: 'setmodlog',
  description: 'Set the channel where mod actions are logged.',
  category: 'Moderation',
  aliases: ['modlogchannel'],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  botPermissions: [],

  data: new SlashCommandBuilder()
    .setName('setmodlog')
    .setDescription('Set the channel where mod actions are logged.')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('The channel to log mod actions in')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute({ message, args }) {
    const channel = message.mentions.channels.first();
    if (!channel) return message.reply("Tch. Mention a channel, extra. Example: `!setmodlog #mod-log`");

    try {
      await GuildSettings.findOneAndUpdate(
        { guildId: message.guild.id },
        { modLogChannelId: channel.id },
        { upsert: true, new: true }
      );
      await message.reply(`Mod log channel set to ${channel}. I'll report every action there. 💥`);
    } catch (err) {
      logError({ command: 'setmodlog', error: err, context: { userTag: message.author.tag } });
      await message.reply("Something exploded. And not in the good way.");
    }
  },

  async slashExecute(interaction) {
    const channel = interaction.options.getChannel('channel');

    try {
      await GuildSettings.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { modLogChannelId: channel.id },
        { upsert: true, new: true }
      );
      await interaction.reply(`Mod log channel set to ${channel}. I'll report every action there. 💥`);
    } catch (err) {
      logError({ command: 'setmodlog', error: err, context: { userTag: interaction.user.tag } });
      await interaction.reply({ content: "Something exploded. And not in the good way.", flags: MessageFlags.Ephemeral });
    }
  },
};