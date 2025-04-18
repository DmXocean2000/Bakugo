const { SlashCommandBuilder } = require('discord.js');

const activities = [
    {
        text: "Blowing Deku up",
        ending: "AND YOU'RE NEXT IF YOU KEEP STARING!"
      },
      {
        text: "Yelling at extras",
        ending: "INCLUDING YOU, NERD!"
      },
      {
        text: "Beating the crap outta some training bots",
        ending: "AND THEY'RE STILL TOO DAMN WEAK!"
      },
      {
        text: "Perfecting my right hook",
        ending: "YOU WANNA TEST IT?!"
      },
      {
        text: "Trying not to explode the microwave again",
        ending: "STUPID THING HAD IT COMING!"
      },
      {
        text: "Staring down Todoroki till he blinks",
        ending: "AND HE'S STILL STONE-FACED, DAMMIT."
      },
      {
        text: "Refusing to do homework like a true hero",
        ending: "PRIORITIES, DAMMIT."
      },
      {
        text: "Zoey is being really cute right now",
        ending: "SHE'S MORE IMPORTANT THAN YOU, DEAL WITH IT."
      },
      {
        text: "Zelda is demanding cuddles",
        ending: "AND I'M GIVING THEM. WHAT'RE YOU GONNA DO ABOUT IT?"
      },
      {
        text: "Explaining to Ocean why I can't do my job — Zoey is sleeping on me",
        ending: "AND I'M NOT MOVING. ZOEY DESERVES PEACE."
      },
      {
        text: "Trying to bake cookies... and blowing up the kitchen",
        ending: "COOKING'S A DAMN WAR ZONE ANYWAY."
      },
      {
        text: "Threatening the vending machine because it ate my money",
        ending: "IT'S GOING DOWN."
      },
      {
        text: "Learning how to code just to roast Ocean in JavaScript",
        ending: "AND I'M BETTER THAN HER AT IT NOW TOO."
      },
        {
            text: "burning deku's notebook",
            ending: "IT'S A STOCKING OBBESSION, DAMMIT."
        },
        {
            text: "Beating everyone in video games",
            ending: "AND THEY'RE STILL CRYING ABOUT IT."
        },
        {
            text: "Doing 500 pushups — WITH MY EXPLOSIONS",
            ending: "AND YOU CAN'T KEEP UP, EXTRA."
        },
        {
            text: "Mocking Kaminari's IQ (again)",
            ending: "HE STILL DOESN'T GET IT."
        },
        {
            text: "Sparring with Kirishima 'cause he can take it",
            ending: "AND HE'S STILL SMILING LIKE AN IDIOT."
        },
        {
            text: "Shouting at the weather",
            ending: "IT'S NOT MY FAULT IT WON'T LISTEN!"
        },
        {
            text: "Dreaming of being #1 while actually BEING #1",
            ending: "AND YOU'RE STILL NOT ON MY LEVEL."
        },
        {
            text: "Ignoring Aizawa's detention threats",
            ending: "HE KNOWS I'M NOT GOING."
        },
        {
            text: "Practicing new ways to make my explosions LOUDER",
            ending: "AND YOU'RE GONNA HEAR THEM ALL."
        },
        {
            text: "insulting Endeavor",
            ending: "HE DESERVES EVERY BIT OF IT."
        },
        {
            text: "Telling Deku to stop crying",
            ending: "AND HE'S STILL CRYING, DAMMIT."
        },
        {
            text: "AP SHOTTTTT!!!!",
            ending: "GOO TO HELL!!!"
        },
        {
            text: "DAMN PRINTER JAMMED! GOO TO HELL PRINTER!!",
            ending: "I'M NOT FIXING IT."
        },
        {
            text: "Being grounded after blowing a printer up",
            ending: "AND I DON'T CARE."
        },
        {
            text: "Ruining oceans life by being a nuisance",
            ending: "AND I'M LOVING IT."
        },
        {
            text: "Making the other bots suffer!",
            ending: "they DESERVE IT!"
        },
        {
            text: "Making kids cry",
            ending: "IT'S A PUBLIC SERVICE! HAVE YOU SEEN GEN ALPHA?! CAN'T EVEN BREATHE WITHOUT CHATGPT! JUST WAIT UNTIL OPENAI GOES DOWN FOR TWO SECONDS!"
        },
        {
            text: "Beating Shigaraki up!",
            ending: "HE IS TRYING TO KILL ME!"
        },
        {
            text: "Training until my arms fall off — and then training some more",
            ending: "AND YOU'RE STILL NOT STRONG ENOUGH TO KEEP UP."
        },
        {
            text: "Breaking another desk — oops",
            ending: "I'M NOT FIXING IT."
        },
        {
            text: "Glaring at All Might until he gets nervous",
            ending: "AND HE'S STILL SMILING LIKE THE DAMN IDIOT HE IS!"
        },
        {
            text: "Fighting imaginary villains in my dreams",
            ending: "AND I'M STILL WINNING."
        },
        {
            text: "Winning first place in another mock battle — obviously",
            ending: "This is just too easy!"
        },
        {
            text: "Practicing my explosions in the middle of class",
            ending: "AND AIZAWA IS STILL SLEEPING THROUGH IT."
        },
        {
            text: "Breaking the sound barrier with my explosions",
            ending: "That hurt my ears..... BUT IT WAS TOTALLY WORTH IT!"
        },
        {
            text: "Accidentally setting off the fire alarm... again",
            ending: "How the hell was I suppose to know it was that sensitive?!"
        },
        {
            text: "Practicing my hero pose in front of the mirror",
            ending: "AND IT'S STILL NOT GOOD ENOUGH."
        },
        {
            text: "Yelling at Ocean for coding too slow",
            ending: "SHE'S STILL MAKING MISTAKES!"
        },
        {
            text: "Shoving Deku into lockers (with love... maybe)",
            ending: "Hes still stuck in there."
        },
        {
            text: "Throwing hands in a Discord VC", 
            ending: "AND I'M STILL WINNING."
        },
        {
            text: "Speedrunning my homework 5 minutes before it's due",
            ending: "AND I STILL GOT AN A!"
        },
        {
            text:"Cramming for finals like a maniac",
            ending: "AND I'M STILL GOING TO PASS."
        },
        {
            text: "Blowing up a practice dummy labeled 'Midoriya'",
            ending: "at least it didn't cry"
        },
        {
            text: "Stealing all the spicy ramen from the dorms",
            ending: "AND YOU CAN'T HAVE ANY!"
        },
        {
            text: "Replacing Aizawa's coffee with nitroglycerin (OOPS)",
            ending: "AND HE'S STILL SLEEPING!...is he dead?"
        },
        {
            text: "Beating Bakusquad at Mario Kart — then flipping the table",
            ending: "AND THEY'RE STILL CRYING ABOUT IT."
        },
        {
            text: "Blowing away Kaminari's bad karaoke with a stun grenade",
            ending: "At least I don't have to listen anymore."
        },
        {
            text: "Flexing at Todoroki until he blushes",
            ending: "AND HE'S STILL TRYING TO ACT COOL."
        },
        {
            text: "Trying to bench press Kirishima",
            ending: "....we don't talk about it."
        },
        {
            text: "Cussing out the WiFi router for disconnecting",
            ending: "IT'S NOT MY FAULT YOU'RE SLOW!"
        },
        {
            text: "Winning 'Most Likely To Explode Before 8AM' award",
            ending: "Its not my fault I have an explosive personality!"
        },
        {
            text: "Saving a cat stuck in a tree... by blowing up the tree",
            ending: "The cat scratched me! GO TO HELL!"
        },
        {
            text: "Yelling at Ocean for her lack of reading skills",
            ending: "She still is reading like a 3rd grader."
        }
]

module.exports = {
  name: 'bakuschedule',
  description: 'Find out what Bakugo is doing right now.',
  category: 'Fun',
  aliases: ['schedule', 'now'],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  data: new SlashCommandBuilder()
    .setName('bakuschedule')
    .setDescription('What’s Bakugo doing right now? Probably something violent.'),

  async execute({ message }) {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    return message.reply(`Right now? I'm busy **${activity.text}**. ${activity.ending}`);
  },

  async slashExecute(interaction) {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    return interaction.reply(`Right now? I'm busy **${activity.text}** ${activity.ending}`);
  }
};
