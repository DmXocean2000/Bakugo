//const { ApplicationCommandOptionType } = require("discord.js");
const trivaData = require('../../jsons/herotrivia.json');

const TIME_LIMIT = 60000; // 60 seconds
const GIVE_UP_KEYWORDS = ['idk', "i don't know", 'i dont know'];
const INSULTS = [
  "Wow... Giving up that fast? Do you even HAVE a brain?",
  "Pathetic. I thought you were gonna try, but you're just another extra.",
  "Seriously? You don't know that? What are you even doing here?",
  "Tch. Fine. Here's the answer, babyface. Next time, try USING YOUR BRAIN.",
  "Ugh, this is embarrassing. Even Deku would've guessed it right.",
];

module.exports = {
  name: "herotrivia",
  description: "I guess your character by asking you 20 questions",
  category: "Fun",
  aliases: ["ht"],
  slash: true,
  legacy: true,
  devOnly: false,
  ownerOnly: false,
  options: [],

  execute: async ({ interaction, message }) => {
    const isInteraction = Boolean(interaction);
    const channel = isInteraction ? interaction.channel : message.channel;
    const authorId = isInteraction ? interaction.user.id : message.author.id;

    const randomIndex = Math.floor(Math.random() * trivaData.length);
    const selectedQuestion = trivaData[randomIndex];
    const correctAnswer = selectedQuestion.correctAnswer;
    const shuffledAnswers = [...selectedQuestion.options].sort(() => Math.random() - 0.5);

    let reply = `**Question:** ${selectedQuestion.question}\n\n`;
    shuffledAnswers.forEach((ans, i) => {
      reply += `**${i + 1}.** ${ans}\n`;
    });
    reply += `\n⏳ You have ${TIME_LIMIT / 1000} seconds to answer. Type the number, the full answer, or say "idk" to give up.`;

    if (isInteraction) {
      await interaction.reply({ content: reply });
    } else {
      await message.reply(reply);
    }

    const filter = response => response.author.id === authorId;
    const collector = channel.createMessageCollector({ filter, time: TIME_LIMIT });

    collector.on('collect', collectedMsg => {
      const userAnswer = collectedMsg.content.trim().toLowerCase();

      // Give-up logic
      if (GIVE_UP_KEYWORDS.includes(userAnswer)) {
        const insult = INSULTS[Math.floor(Math.random() * INSULTS.length)];
        channel.send(`<@${authorId}> ${insult} The correct answer was **${correctAnswer}**.`);
        return collector.stop();
      }

      const indexAnswer = shuffledAnswers[parseInt(userAnswer) - 1];

      if (
        userAnswer === correctAnswer.toLowerCase() ||
        (indexAnswer && indexAnswer.toLowerCase() === correctAnswer.toLowerCase())
      ) {
        channel.send(`<@${authorId}> Correct! Good job paying attention.`);
        collector.stop();
      } else {
        channel.send(`<@${authorId}> Incorrect. The correct answer was **${correctAnswer}**.`);
        collector.stop();
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        channel.send(`<@${authorId}> ⏰ Time's up! The correct answer was **${correctAnswer}**.`);
      }
    });
  }
};
