const isWhitelisted = require('../utils/isWhiteListed.js');
// Inside the event callback, after the bot check:
const logError = require('../utils/logError');

const {ownerIDs} = require('../../config.js');
const {devIDs} = require('../../config.js');
const prefix = '!';

module.exports = (client) => {
  //console.log('[DEBUG] messageCreate listener loaded.');
  client.on('messageCreate', async (message) => {
    if (!isWhitelisted(message.guild?.id)) return;
    if (message.author.bot || !message.content.startsWith(prefix)) return; 

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) 
    || [...client.commands.values()].find(cmd => cmd.aliases?.includes(commandName));  
    if (!command || !command.legacy) return;


    if (command.ownerOnly && !ownerIDs.includes(message.author.id)) {
      return message.reply("YOU'RE NOT MY OWNER! GO TO HELL!");
    }

    if (command.devOnly && !devIDs.includes(message.author.id)) {
      return message.reply("Your not a developer. Get lost!");
    }
    // 🔒 User permission check
    if (command.userPermissions?.length) {
      const missing = command.userPermissions.filter(
        perm => !message.member.permissions.has(perm)
      );
      if (missing.length) {
        return message.reply("Tch. You don't have permission to use that command, extra!");
      }
    }

    // 🔒 Bot permission check
    if (command.botPermissions?.length) {
      const missing = command.botPermissions.filter(
        perm => !message.guild.members.me.permissions.has(perm)
      );
      if (missing.length) {
        return message.reply("I'm missing permissions I need for that. Yell at whoever set up my roles!");
      }
    }
    try {
      await command.execute({
        message,
        args,
        client,
        interaction: null,
      });
    } catch (err) {
      logError({
        command: commandName,
        error: err,
        context: {
          userTag: message.author.tag,
          messageContent: message.content,
        },
      });

      if (!message.replied && !message.deferred) {
        await message.reply("Tch. Something exploded. And not in the good way.");
      }
    }
  });
};
