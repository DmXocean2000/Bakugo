const { ApplicationCommandOptionType } = require("discord.js");
const characterData = require('../../jsons/mha_characters.json');
const mongoose = require("mongoose");
const twentyScoreCountSchema = require("../../models/twentyScoreCountSchema");

const TIME_LIMIT = 120000; // 2 minutes
const MAX_QUESTIONS = 20;

const keywordMappings = {
  gender: ['gender', 'boy', 'girl', 'female', 'male'],
  role: ['role', 'job', 'occupation', 'position', 'profession', 'title', 'student'],
  quirkType: ['quirk'],
  age: ['age', 'old', 'young'],
  condition: ['condition', 'alive', 'dead', 'status', 'deceased'],
  height: ['height', 'tall', 'short'],
  faction: ['villain', 'hero', 'faction', 'group', 'team', 'career'],
  hairColor : ['hair color'],
  eyeColor: ['eye color', 'eyes', 'eye'],
  bloodType: ['blood type', 'blood', 'bloodtype'], 
  hairLength: ['hair length'],
  school: ['school'],
  class: ['class'], 
  supportGear: ['gear', 'armor', 'weapon', 'equipment'], 
  associatedColor: ['color', 'colors'],
  medical: ['medical', 'healthy', 'illness', 'ill'], 
  siblings: ['siblings', 'sister', 'brother'], 
  skinType: ['skin'], 
  martial: ['married'],
  'question count': ['question count'],
};

const GIVE_UP_KEYWORDS = ['idk', "i don't know", 'i dont know', 'give up'];
const INSULTS = [
  "What the hell? Giving up already?! Pathetic!",
  "Tch. Figures you'd give up. Loser.",
  "That’s it? No brain cells left, huh?",
  "You call that trying? Even DEKU would've done better!",
  "You're the reason I get headaches. Giving up that fast. Unbelievable.",
  "Damn. I don't know why I had hope in you.",
  "Are you even trying? At LEAST deku tries!",
  "Kaminari or you... who's dumber? Tough choice.",
];

module.exports = {
  name: "twenty",
  description: "I guess your MHA character by answering up to 20 of your questions.",
  category: "Fun",
  aliases: ["20q"],
  slash: true,
  legacy: true,
  devOnly: false,
  ownerOnly: false,
  options: [],

  execute: async ({ interaction, message }) => {
    const isInteraction = Boolean(interaction);
    const channel = isInteraction ? interaction.channel : message.channel;
    const authorId = isInteraction ? interaction.user.id : message.author.id;
    const authorName = isInteraction ? interaction.user.username : message.author.username;

    const randomIndex = Math.floor(Math.random() * characterData.length);
    const selectedCharacter = characterData[randomIndex];
    let questionCount = 0;

    const introMsg = `I'm thinking of a My Hero Academia character.\nYou have **${MAX_QUESTIONS} questions** and **${TIME_LIMIT / 1000} seconds**.\nStart asking questions or make a guess!`;

    if (isInteraction) {
      await interaction.reply({ content: introMsg });
    } else {
      await message.reply(introMsg);
    }

    const filter = msg => msg.author.id === authorId && !msg.author.bot;
    const collector = channel.createMessageCollector({ filter, time: TIME_LIMIT });

    collector.on('collect', async userMsg => {
      const userInput = userMsg.content.toLowerCase().trim();

      // Give-up logic
      if (GIVE_UP_KEYWORDS.includes(userInput)) {
        const insult = INSULTS[Math.floor(Math.random() * INSULTS.length)];
        await channel.send(`<@${authorId}> ${insult} The character was **${selectedCharacter.callname}**.`);
        return collector.stop('gaveUp');
      }

      let foundMatch = false;

      // Question logic
      for (const [attribute, keywords] of Object.entries(keywordMappings)) {
        for (const keyword of keywords) {
          if (userInput.includes(keyword)) {
            const answer = selectedCharacter[attribute];
            if (answer !== undefined) {
              const response = `The character's ${attribute.split(/(?=[A-Z])/).join(' ').toLowerCase()} is **${answer}**.`;
              await channel.send(response);
              foundMatch = true;
              break;
            }
          }
        }
        if (foundMatch) break;
      }

      // Guess logic
      if (!foundMatch) {
        if (isCorrectGuess(userInput, selectedCharacter)) {
          await channel.send(`🎉 Congratulations, <@${authorId}>! You guessed **${selectedCharacter.callname}** correctly!`);
          await updateScore(authorId, authorName);
          collector.stop('guessedCorrectly');
        } else if (userInput.includes("question count")) {
          await channel.send(`You’ve asked ${questionCount} questions. You have ${MAX_QUESTIONS - questionCount} left.`);
          questionCount--; // don't count this one
        } else {
          await channel.send(`❌ Nope, <@${authorId}>. Try harder.`);
        }
      }

      questionCount++;
      if (questionCount >= MAX_QUESTIONS) {
        collector.stop('reachedLimit');
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'reachedLimit') {
        channel.send(`🔚 You've reached your question limit! The character was **${selectedCharacter.callname}**.`);
      } else if (reason === 'guessedCorrectly' || reason === 'gaveUp') {
        // Already handled during collection, don't say anything else
        return;
      } else {
        channel.send(`⏰ Time's up! The character was **${selectedCharacter.callname}**.`);
      }
    });
    

    function isCorrectGuess(guess, character) {
      const validNames = [
        character.callname,
        character.firstName,
        character.lastName,
        character.hvName,
        ...(Array.isArray(character.OKN) ? character.OKN : [])
      ]
        .filter(Boolean)
        .map(name => name.toLowerCase())
        .filter(name => name !== 'unknown' && name !== 'n/a' && name !== 'none');

      return validNames.includes(guess.toLowerCase());
    }

    async function updateScore(userId, userName) {
      try {
        await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 30000,
        });

        await twentyScoreCountSchema.findOneAndUpdate(
          { userId },
          {
            $inc: { score: 1 },
            $set: { userName },
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error("Error updating score:", err);
      }
    }
  },
};
