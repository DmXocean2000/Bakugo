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
      return message.reply("YOUR NOT MY OWNER! GO TO HELL!");
    }

    if (command.devOnly && !devIDs.includes(message.author.id)) {
      return message.reply("Your not a developer. Get lost!");
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
