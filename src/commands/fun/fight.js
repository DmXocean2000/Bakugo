const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const resolveTarget = require('../../utils/resolveTarget');

const attacks = [
// { move: "your attack text here", dmg: [min, max] },
  { move: "threw a RIGHT HOOK", dmg: [15, 30] },
  { move: "launched an AP SHOT", dmg: [25, 40] },
  { move: "used HOWITZER IMPACT", dmg: [35, 50] },
  { move: "landed a STUN GRENADE", dmg: [20, 35] },
  { move: "unleashed an EXPLOSION BARRAGE", dmg: [30, 45] },
  { move: "did a FLYING KNEE", dmg: [10, 25] },
  { move: "pulled off a SWEATY PALM SLAP", dmg: [5, 20] },
  { move: "threw a FULL POWER HAYMAKER", dmg: [40, 55] },
  { move: "hit a CHEAP SHOT (I respect it)", dmg: [10, 20] },
  { move: "used NITROGLYCERIN BURST", dmg: [25, 45] },
  { move: "went for the DETROIT SMASH (wait, wrong person)", dmg: [30, 50] },
  { move: "tripped and ACCIDENTALLY headbutted", dmg: [5, 15] },
];

const misses = [
  "swung and COMPLETELY WHIFFED! Pathetic!",
  "tried to attack but tripped over their own feet! HA!",
  "threw a punch at thin air! What a loser!",
  "charged up and... sneezed. Momentum ruined!",
  "went for a kick but pulled a hamstring! WEAK!",
];

const crits = [
  "landed a CRITICAL HIT! THAT'S WHAT I'M TALKING ABOUT! 💥💥💥",
  "got a DEVASTATING BLOW! THE CROWD GOES WILD!",
  "absolutely DESTROYED THEM with that hit! PLUS ULTRA! 💥",
];

const winLines = [
  "AND IT'S OVER! {winner} DESTROYED {loser}! GET WRECKED, EXTRA! 💥",
  "{winner} WINS! {loser} is eating dirt! THAT'S WHAT YOU GET!",
  "VICTORY FOR {winner}! {loser} never stood a chance! PATHETIC!",
  "{winner} absolutely ANNIHILATED {loser}! Now THAT'S a fight! 💥",
  "IT'S DONE! {winner} stands victorious over {loser}'s sorry remains!",
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function simulateFight(name1, name2) {
  let hp1 = 100, hp2 = 100;
  const log = [];
  let round = 0;

  const fighters = [
    { name: name1, getHp: () => hp1, setHp: (v) => { hp1 = v; }, enemyHp: () => hp2, setEnemyHp: (v) => { hp2 = v; } },
    { name: name2, getHp: () => hp2, setHp: (v) => { hp2 = v; }, enemyHp: () => hp1, setEnemyHp: (v) => { hp1 = v; } },
  ];

  while (hp1 > 0 && hp2 > 0 && round < 15) {
    round++;
    const attacker = fighters[round % 2 === 1 ? 0 : 1];
    const roll = Math.random();

    if (roll < 0.15) {
      const miss = misses[Math.floor(Math.random() * misses.length)];
      log.push(`**Round ${round}:** ${attacker.name} ${miss}`);
      continue;
    }

    const isCrit = roll > 0.90;
    const attack = attacks[Math.floor(Math.random() * attacks.length)];
    let dmg = rand(attack.dmg[0], attack.dmg[1]);

    if (isCrit) {
      dmg = Math.floor(dmg * 1.8);
      const critLine = crits[Math.floor(Math.random() * crits.length)];
      attacker.setEnemyHp(Math.max(0, attacker.enemyHp() - dmg));
      log.push(`**Round ${round}:** ${attacker.name} ${attack.move} for **${dmg} DMG**! ${critLine}`);
    } else {
      attacker.setEnemyHp(Math.max(0, attacker.enemyHp() - dmg));
      log.push(`**Round ${round}:** ${attacker.name} ${attack.move} for **${dmg} DMG**!`);
    }
  }

  const winner = hp1 > hp2 ? name1 : hp2 > hp1 ? name2 : null;
  const loser = winner === name1 ? name2 : name1;

  let result;
  if (!winner) {
    result = "IT'S A DRAW?! Tch. BOTH of you are weak! Fight again!";
  } else {
    result = winLines[Math.floor(Math.random() * winLines.length)]
      .replace(/{winner}/g, winner)
      .replace(/{loser}/g, loser);
  }

  return { log, hp1, hp2, result, rounds: round };
}

/**
 * Parse fighter names from legacy args.
 * Supports: @mentions, raw IDs, plain text names, and "quoted names"
 * Examples:
 *   !fight @Ocean @Shadow //users in server
 *   !fight Claude ChatGPT // random entities
 *   !fight "My Will To Live" "This Semester" // more chaos
 *   !fight @Ocean Deku //user and a random entity
 */ 
async function parseFighters(guild, args) {
  const raw = args.join(' ');

  // Try to extract quoted strings first
  const quoted = [...raw.matchAll(/"([^"]+)"/g)].map(m => m[1]);
  if (quoted.length === 2) {
    return { name1: quoted[0], name2: quoted[1] };
  }

  // Otherwise work through args, resolving mentions/IDs or using as plain text
  const fighters = [];
  for (const arg of args) {
    // Try to resolve as a server member
    const member = await resolveTarget(guild, arg);
    if (member) {
      fighters.push(member.displayName);
    } else {
      // Plain text name
      fighters.push(arg);
    }

    if (fighters.length === 2) break;
  }

  if (fighters.length < 2) return null;
  return { name1: fighters[0], name2: fighters[1] };
}

module.exports = {
  name: 'fight',
  description: 'Simulate an epic fight between two fighters.',
  category: 'Fun',
  aliases: ['battle', 'vs'],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  userPermissions: [],
  botPermissions: [],

  data: new SlashCommandBuilder()
    .setName('fight')
    .setDescription('Simulate an epic fight between two fighters.')
    .addStringOption(opt =>
      opt.setName('fighter1').setDescription('First fighter (mention, ID, or any name)').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('fighter2').setDescription('Second fighter (mention, ID, or any name)').setRequired(true)
    ),

  async execute({ message, args }) {
    if (args.length < 2) {
      return message.reply('Tch. I need TWO fighters, idiot! `!fight Deku Todoroki` or `!fight @user1 @user2` or `!fight "My Cat" "Your Dog"`');
    }

    const fighters = await parseFighters(message.guild, args);
    if (!fighters) {
      return message.reply("Give me two fighters, extra! Names, mentions, IDs — I don't care, just give me TWO!");
    }

    const { name1, name2 } = fighters;

    if (name1.toLowerCase() === name2.toLowerCase()) {
      return message.reply("You want someone to fight THEMSELVES?! That's just therapy with extra steps!");
    }

    const { log, hp1, hp2, result, rounds } = simulateFight(name1, name2);
    const battleLog = log.length > 10 ? [...log.slice(0, 4), '**...**', ...log.slice(-4)] : log;

    const embed = new EmbedBuilder()
      .setColor(0xFF4500)
      .setTitle(`⚔️ ${name1} vs ${name2} ⚔️`)
      .setDescription(battleLog.join('\n'))
      .addFields(
        { name: `${name1} HP`, value: `${Math.max(0, hp1)}/100`, inline: true },
        { name: `${name2} HP`, value: `${Math.max(0, hp2)}/100`, inline: true },
        { name: 'Rounds', value: `${rounds}`, inline: true },
      )
      .setFooter({ text: result })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },

  async slashExecute(interaction) {
    const raw1 = interaction.options.getString('fighter1');
    const raw2 = interaction.options.getString('fighter2');

    // Try to resolve as server members, fall back to plain text
    const member1 = await resolveTarget(interaction.guild, raw1);
    const member2 = await resolveTarget(interaction.guild, raw2);

    const name1 = member1 ? member1.displayName : raw1;
    const name2 = member2 ? member2.displayName : raw2;

    if (name1.toLowerCase() === name2.toLowerCase()) {
      return interaction.reply("You want someone to fight THEMSELVES?! That's just therapy with extra steps!");
    }

    const { log, hp1, hp2, result, rounds } = simulateFight(name1, name2);
    const battleLog = log.length > 10 ? [...log.slice(0, 4), '**...**', ...log.slice(-4)] : log;

    const embed = new EmbedBuilder()
      .setColor(0xFF4500)
      .setTitle(`⚔️ ${name1} vs ${name2} ⚔️`)
      .setDescription(battleLog.join('\n'))
      .addFields(
        { name: `${name1} HP`, value: `${Math.max(0, hp1)}/100`, inline: true },
        { name: `${name2} HP`, value: `${Math.max(0, hp2)}/100`, inline: true },
        { name: 'Rounds', value: `${rounds}`, inline: true },
      )
      .setFooter({ text: result })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};