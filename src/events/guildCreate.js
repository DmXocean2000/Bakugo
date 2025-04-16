const { serverWhitelist } = require('../../config');

module.exports = (client) => {
  client.on('guildCreate', async (guild) => {
    if (!serverWhitelist.includes(guild.id)) {
      console.log(`💥 Unauthorized guild detected: ${guild.name} (${guild.id})`);
      try {
        await guild.leave();
        console.log(`👋 Bakugo left ${guild.name}`);
      } catch (err) {
        console.error(`❌ Failed to leave guild ${guild.name}:`, err);
      }
    } else {
      console.log(`✅ Bakugo joined approved guild: ${guild.name} (${guild.id})`);
    }
  });
};
