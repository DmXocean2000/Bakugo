module.exports = {
  name: "say",
  description: "Makes Bakugo say something (owner only)",
  category: "Owner",
  aliases: [],
  slash: false,
  legacy: true,
  devOnly: true,
  ownerOnly: true,
  options: [],

  execute: async ({ message, args }) => {
    const ownerIDs = ['742486693008900166'];

    if (!message || !ownerIDs.includes(message.author.id)) {
      return message.reply("YOU'RE NOT MY OWNER! GET LOST EXTRA!!!");
    }

    const content = args.join(" ");
    if (!content) {
      return message.reply("Say what? your a dumbass? You gotta give me something to yell.");
    }

    await message.delete().catch(() => {});
    return message.channel.send(content); // ✅ Make sure this is returned!
  },
};
