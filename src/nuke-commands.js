// nuke-commands.js
const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('💣 Nuking all guild slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: [] }
    );

    console.log('✅ All slash commands wiped from the guild.');
  } catch (err) {
    console.error('❌ Failed to nuke commands:', err);
  }
})();
