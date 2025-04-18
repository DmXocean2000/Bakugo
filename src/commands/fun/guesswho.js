const { MessageFlags } = require('discord.js');
const path = require('path');
const fs = require('fs');
const characterData = require('../../jsons/mha_characters.json');

module.exports = {
  name: 'guesswho',
  description: 'Guess the MHA character from the image!',
  category: 'Games',
  aliases: ['guess'],
  legacy: true,
  slash: false, // Optional later, but this one is better as legacy for now
  devOnly: false,
  ownerOnly: false,

  async execute({ message }) {
    const TIME_LIMIT = 60000; // 60 seconds
    const GIVE_UP_PHRASES = ['give up', 'i give up', 'idk', 'no idea'];

    // Pick a random character
    const randomIndex = Math.floor(Math.random() * characterData.length);
    const selectedCharacter = characterData[randomIndex];

    if (!selectedCharacter.callname || selectedCharacter.callname === "Unknown" || selectedCharacter.callname === "N/A") {
      return message.reply("Tch. I pulled some nobody out of a hat. Try again."); // fallback if somehow invalid
    }

    // Tell user
    await message.reply(`I'm thinking of a *My Hero Academia* character. Who is it? You have **${TIME_LIMIT / 1000} seconds** to guess!`);

    // Send image
    if (selectedCharacter.Image.startsWith('http')) {
      await message.channel.send(selectedCharacter.Image);
    } else {
      const imagePath = path.join(__dirname, '../../jsons', selectedCharacter.Image);
      if (fs.existsSync(imagePath)) {
        await message.channel.send({
          files: [{
            attachment: imagePath,
            name: path.basename(selectedCharacter.Image)
          }]
        });
      } else {
        await message.channel.send('Tch. I lost the picture. Deal with it.');
      }
    }

    // Set up collector
    const filter = (response) => !response.author.bot;
    const collector = message.channel.createMessageCollector({ filter, time: TIME_LIMIT });

    collector.on('collect', (response) => {
      const guess = response.content.toLowerCase();

      const matches = [
        selectedCharacter.callname?.toLowerCase(),
        selectedCharacter.firstName?.toLowerCase(),
        selectedCharacter.lastName?.toLowerCase(),
        selectedCharacter.hvName?.toLowerCase(),
      ].filter(Boolean);

      if (matches.includes(guess)) {
        message.channel.send(`Congrats, ${response.author}! You actually have a brain cell! The answer was **${selectedCharacter.callname}**.`);
        return collector.stop('guessed');
      }

      if (GIVE_UP_PHRASES.includes(guess)) {
        message.channel.send(`Tch. Giving up already, ${response.author}? The answer was **${selectedCharacter.callname}**. Try harder next time.`);
        return collector.stop('gave_up');
      }

      // Wrong guess
      response.channel.send(`Wrong, ${response.author}! You need remedial MHA classes!`);
    });

    collector.on('end', (collected, reason) => {
      if (reason !== 'guessed' && reason !== 'gave_up') {
        message.channel.send(`Time's up! The character was **${selectedCharacter.callname}**. Try not to suck so much next time.`);
      }
    });
  },
};
