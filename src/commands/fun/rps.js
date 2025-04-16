module.exports = {
    name: 'rps',
    description: "Play Rock, Paper Scissors with Bakugo!",
    category: 'Fun',
    legacy: true,
    slash: true,
    options: [
      {
        name: 'choice',
        description: 'Your choice: rock, paper, or scissors',
        type: 3, // STRING
        required: true,
      },
    ],
  
    async execute({ message, args }) {
      const declare = args[0];
      const choice = declare.toLowerCase();
      const acceptedReplies = ['rock', 'paper', 'scissors'];
      const random = Math.floor((Math.random() * acceptedReplies.length));
      const result = acceptedReplies[random];
  
      switch (choice) {
        case 'rock': {
          if (result === 'paper') return message.reply(`You chose ${choice} and I chose ${result}. IM THE BEST!`);
          if (result === choice) return message.reply(`You and I both chose ${result}. DEKU!! THAT DAMN NERD DID SOMETHING!!`);
          return message.reply(`You chose ${choice} and I chose ${result}. Go to hell!`);
        }
        case 'paper': {
          if (result === 'scissors') return message.reply(`You chose ${choice} and I chose ${result}. IM THE BEST!`);
          if (result === choice) return message.reply(`You and I both chose ${result}. DEKU!! THAT DAMN NERD DID SOMETHING!!`);
          return message.reply(`You chose ${choice} and I chose ${result}. Go to hell!`);
        }
        case 'scissors': {
          if (result === 'rock') return message.reply(`You chose ${choice} and I chose ${result}. IM THE BEST!`);
          if (result === choice) return message.reply(`You and I both chose ${result}. DEKU!! THAT DAMN NERD DID SOMETHING!!`);
          return message.reply(`You chose ${choice} and I chose ${result}. Go to hell!`);
        }
        case 'bakugo':
        case 'katsuki': {
          return message.reply(`YOU CHOSE ME! AND I BLOW EVERYTHING UP! I HOPE YOU ENJOY HELL!`);
        }
        case 'deku':
        case 'izuku':
        case 'midoriya': {
          return message.reply(`He cried so hard he drowned. IM THE BEST!`);
        }
        case 'ocean': {
          return message.reply(`How dare you try to use her against me! She may have created me BUT I'M STILL THE BEST!!`);
        }
        default: {
          return message.reply(`You picked ${choice} and I picked ${result}. THAT'S NOT EVEN AN OPTION! STOP TRYING TO GET AROUND THE RULES DEKU!`);
        }
      }
    },
  
    async slashExecute(interaction) {
      const choice = interaction.options.getString('choice').toLowerCase();
      const acceptedReplies = ['rock', 'paper', 'scissors'];
      const random = Math.floor((Math.random() * acceptedReplies.length));
      const result = acceptedReplies[random];
  
      switch (choice) {
        case 'rock': {
          if (result === 'paper') return interaction.reply(`You chose ${choice} and I chose ${result}. IM THE BEST!`);
          if (result === choice) return interaction.reply(`You and I both chose ${result}. DEKU!! THAT DAMN NERD DID SOMETHING!!`);
          return interaction.reply(`You chose ${choice} and I chose ${result}. Go to hell!`);
        }
        case 'paper': {
          if (result === 'scissors') return interaction.reply(`You chose ${choice} and I chose ${result}. IM THE BEST!`);
          if (result === choice) return interaction.reply(`You and I both chose ${result}. DEKU!! THAT DAMN NERD DID SOMETHING!!`);
          return interaction.reply(`You chose ${choice} and I chose ${result}. Go to hell!`);
        }
        case 'scissors': {
          if (result === 'rock') return interaction.reply(`You chose ${choice} and I chose ${result}. IM THE BEST!`);
          if (result === choice) return interaction.reply(`You and I both chose ${result}. DEKU!! THAT DAMN NERD DID SOMETHING!!`);
          return interaction.reply(`You chose ${choice} and I chose ${result}. Go to hell!`);
        }
        case 'bakugo':
        case 'katsuki': {
          return interaction.reply(`YOU CHOSE ME! AND I BLOW EVERYTHING UP! I HOPE YOU ENJOY HELL!`);
        }
        case 'deku':
        case 'izuku':
        case 'midoriya': {
          return interaction.reply(`He cried so hard he drowned. IM THE BEST!`);
        }
        case 'ocean': {
          return interaction.reply(`How dare you try to use her against me! She may have created me BUT I'M STILL THE BEST!!`);
        }
        default: {
          return interaction.reply(`You picked ${choice} and I picked ${result}. THAT'S NOT EVEN AN OPTION! STOP TRYING TO GET AROUND THE RULES DEKU!`);
        }
      }
    }
  };
  