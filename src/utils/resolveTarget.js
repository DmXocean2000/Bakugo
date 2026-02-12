/**
 * Resolve a GuildMember from a mention or raw ID string.
 * Accepts: @mention, <@id>, <@!id>, or raw numeric ID
 */
module.exports = async function resolveTarget(guild, arg) {
  if (!arg) return null;
  const id = arg.replace(/[<@!>]/g, '');
  if (!/^\d+$/.test(id)) return null;
  return guild.members.fetch(id).catch(() => null);
};