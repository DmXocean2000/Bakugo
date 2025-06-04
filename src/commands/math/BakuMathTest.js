const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const PRAISES = [
  "Not bad, nerd!",
  "You actually got it right!",
  "Hah! Maybe you're not totally useless.",
  "About damn time you answered correctly.",
  "Fine, that one's right. Don't get cocky!"
];

const INSULTS = [
  "Wrong! Are you even trying?",
  "Pathetic! Use that brain of yours!",
  "Tch. That's just sad.",
  "Nope! I've seen toddlers do better.",
  "Seriously? That's the best you can do?"
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  const ops = ['+', '-', '*', '/'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;

  switch (op) {
    case '+':
      a = randInt(1, 20);
      b = randInt(1, 20);
      answer = a + b;
      break;
    case '-':
      a = randInt(1, 20);
      b = randInt(1, 20);
      answer = a - b;
      break;
    case '*':
      a = randInt(1, 12);
      b = randInt(1, 12);
      answer = a * b;
      break;
    case '/':
      b = randInt(1, 12);
      answer = randInt(1, 12);
      a = b * answer; // ensure whole number result
      break;
  }

  return {
    text: `${a} ${op} ${b}`,
    answer
  };
}

async function askQuestion(channel, userId, number) {
  const { text, answer } = generateQuestion();
  const embed = new EmbedBuilder()
    .setColor('Orange')
    .setTitle(`Question ${number}`)
    .setDescription(`Solve: **${text}**`);

  await channel.send({ embeds: [embed] });

  return new Promise(resolve => {
    const filter = msg => msg.author.id === userId && !msg.author.bot;
    const collector = channel.createMessageCollector({ filter, time: 15000, max: 1 });
    let responded = false;

    collector.on('collect', msg => {
      responded = true;
      const userAnswer = parseInt(msg.content.trim(), 10);
      if (!isNaN(userAnswer) && userAnswer === answer) {
        channel.send(PRAISES[Math.floor(Math.random() * PRAISES.length)]);
        resolve(true);
      } else {
        channel.send(INSULTS[Math.floor(Math.random() * INSULTS.length)]);
        resolve(false);
      }
    });

    collector.on('end', collected => {
      if (!responded) {
        channel.send(`Too slow! The answer was **${answer}**.`);
        resolve(false);
      }
    });
  });
}

async function runQuiz(channel, user) {
  let score = 0;
  for (let i = 1; i <= 5; i++) {
    const correct = await askQuestion(channel, user.id, i);
    if (correct) score++;
  }

  let finalMessage;
  if (score === 5) {
    finalMessage = "Tch. You’re not a complete extra after all.";
  } else if (score >= 3) {
    finalMessage = "You barely survived, dumbass.";
  } else {
    finalMessage = "Pathetic. Go back to preschool.";
  }

  channel.send(`<@${user.id}> You scored **${score}/5**. ${finalMessage}`);
}

module.exports = {
  name: 'bakumathtest',
  description: 'Bakugo tests your puny math skills with 5 questions.',
  category: 'Fun',
  aliases: ['mathquiz'],
  legacy: true,
  slash: true,
  data: new SlashCommandBuilder()
    .setName('bakumathtest')
    .setDescription('Take Bakugo\'s math quiz'),

  async execute({ message }) {
    await runQuiz(message.channel, message.author);
  },

  async slashExecute(interaction) {
    await interaction.deferReply();
    await runQuiz(interaction.channel, interaction.user);
  }
};
