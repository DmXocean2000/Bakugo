const {ocean} = require('../../../config.js');
const clean = (text) => {
  if (typeof text !== "string") {
    text = require("util").inspect(text, { depth: 1 });
  }

  // Redact all environment variable values
  const envSecrets = Object.values(process.env).filter(Boolean);
  envSecrets.forEach(secret => {
    if (typeof secret === 'string') {
      const escaped = secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape special chars
      text = text.replace(new RegExp(`\\b${escaped}\\b`, 'g'), '[REDACTED]');
    }
  });

  // Redact all config values (only if string or pure IDs)
  const config = require('../../../config');
  const configSecrets = Object.values(config)
    .flatMap(v => Array.isArray(v) ? v : [v])
    .filter(v => typeof v === 'string' && /^\d{15,21}$/.test(v)); // only redact large IDs

  configSecrets.forEach(secret => {
    const escaped = secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(`\\b${escaped}\\b`, 'g'), '[REDACTED]');
  });

  return text
    .replaceAll('`', '`\u200b')
    .replaceAll('@', '@\u200b');
};



module.exports = {
  name: 'eval',
  description: 'Evaluates JS code (Ocean only)',
  devOnly: true,
  legacy: true,
  slash: false,

  async execute({ message, args }) {
    if (message.author.id !== ocean) {
      const deniedLines = [
        "YOU WANNA EVAL! PAY FOR MY VPS AND FOR OCEANS TIME THEN MAYBE YOU CAN!",
        "You're not worthy of this power, extra.",
        "You think I'd let YOU use eval? Get lost.",
        "You're not Ocean. You're not even half a Deku.",
        "Nice try. Now go sit in the back of the class.",
        "Get your own damn bot!",
      ];
      
      return message.reply(deniedLines[Math.floor(Math.random() * deniedLines.length)]);
      
    }
    if (!args.length && message.author.id === ocean) {
      const snark = [
        "Tch. You didn’t even give me code to explode.",
        "I’m not a mind reader, nerd.",
        "What the hell is this? You call that a command?",
        "You forgot the code! PLEASE STUDY JS BEFORE RUNNING THIS COMMAND AGAIN!",
        "Delete this command since you can't use it!",
        "At least throw something into the arena!",
        "Still stupid I see.",
      ];
      
      return message.reply(snark[Math.floor(Math.random() * snark.length)]);
      
    }
    

    try {
      const result = eval(args.join(" "));
      await message.reply(`\`\`\`js\n${clean(result)}\n\`\`\``);
    } catch (err) {
      await message.reply(`\`\`\`js\nError: ${clean(err.message)}\n\`\`\``);
    }
  }
};
