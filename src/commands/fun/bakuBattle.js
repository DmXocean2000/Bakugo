const { EmbedBuilder } = require('discord.js');
const cards = require('../../jsons/cards.json');
const canonBattles = require('../../jsons/canon_battles.json');

// Battle constants
const SPECIAL_SUCCESS_THRESHOLD = 4;
const SPECIAL_MULTIPLIER = 8; // Changed from 3 to 8
const RECOIL_DAMAGE = 5;
const HP_MULTIPLIER = 10;
const BATTLE_TIMEOUT = 300000; // 5 minutes
const MAX_MESSAGE_LENGTH = 1900; // Leave buffer for Discord's 2000 char limit

// DEV MODE TEST TEAMS - Edit these whenever you need to test specific cards
// Special characters (from cards.special_characters) get higher stats and die after one kill
// Students (from cards.students) have normal stats
/*
const DEV_PLAYER_CARDS = [
  { name: "Shoto Todoroki", power: 2 },
  { name: "Izuku Midoriya", power: 2 },
  { name: "Katsuki Bakugo", power: 2 }
];

const DEV_BAKUGO_CARDS = [
  { name: "Minoru Mineta", power: 2 },
  { name: "Denki Kaminari", power: 2 },
  { name: "Mashirao Ojiro", power: 2 }
];*/

// Utility functions
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollDice() {
  return randInt(1, 6);
}

// Message batching class
class MessageBatcher {
  constructor(channel) {
    this.channel = channel;
    this.buffer = [];
    this.currentMessage = '';
  }

  add(text) {
    if (this.currentMessage.length + text.length + 1 > MAX_MESSAGE_LENGTH) {
      // Current message would overflow, flush it
      this.buffer.push(this.currentMessage);
      this.currentMessage = text;
    } else {
      if (this.currentMessage.length > 0) {
        this.currentMessage += '\n' + text;
      } else {
        this.currentMessage = text;
      }
    }
  }

  addImmediate(text) {
    // For things that need to be sent right away (like embeds)
    this.flush();
    this.buffer.push(text);
  }

  async flush() {
    if (this.currentMessage.length > 0) {
      this.buffer.push(this.currentMessage);
      this.currentMessage = '';
    }

    for (const msg of this.buffer) {
      if (typeof msg === 'string') {
        await this.channel.send(msg);
      } else {
        await this.channel.send(msg); // For embeds
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between messages
    }

    this.buffer = [];
  }
}

function assignRandomCards(count) {
  const allStudents = Object.keys(cards.students);
  const allSpecial = cards.special_characters ? Object.keys(cards.special_characters) : [];
  
  const selected = [];
  const used = new Set();
  
  while (selected.length < count) {
    let cardPool;
    let isSpecial = false;
    
    // 20% chance for special character, 80% for student
    const roll = Math.random();
    if (roll < 0.2 && allSpecial.length > 0) {
      cardPool = allSpecial;
      isSpecial = true;
    } else {
      cardPool = allStudents;
    }
    
    // Pick a random card from the selected pool
    const randomIndex = Math.floor(Math.random() * cardPool.length);
    const character = cardPool[randomIndex];
    
    if (!used.has(character)) {
      used.add(character);
      
      const characterData = isSpecial ? cards.special_characters[character] : cards.students[character];
      
      // Special characters get 3-5 power, students get 1-3
      const power = isSpecial ? randInt(3, 5) : randInt(1, 3);
      // Everyone uses the same HP multiplier now
      const maxHp = power * HP_MULTIPLIER;
      
      selected.push({
        name: character,
        power: power,
        hp: maxHp,
        maxHp: maxHp,
        special_used: false,
        special_name: characterData.special_name,
        flavor_text: characterData.flavor_text,
        is_special: isSpecial,
        tier: characterData.tier || 'student'
      });
    }
  }
  return selected;
}

function assignSpecificCards(cardNames) {
  const selected = [];
  
  for (const name of cardNames) {
    const cleanName = name.trim();
    if (cards.students[cleanName]) {
      const power = randInt(1, 3);
      const maxHp = power * HP_MULTIPLIER;
      selected.push({
        name: cleanName,
        power: power,
        hp: maxHp,
        maxHp: maxHp,
        special_used: false,
        special_name: cards.students[cleanName].special_name,
        flavor_text: cards.students[cleanName].flavor_text
      });
    }
  }
  return selected;
}

function createDevCards(devCardArray) {
  const selected = [];
  
  for (const cardData of devCardArray) {
    const { name, power } = cardData;
    
    // Check if it's a special character or student
    const isSpecial = cards.special_characters && cards.special_characters[name];
    const characterData = isSpecial ? cards.special_characters[name] : cards.students[name];
    
    if (characterData) {
      // Everyone uses the same HP multiplier now
      const maxHp = power * HP_MULTIPLIER;
      
      selected.push({
        name: name,
        power: power,
        hp: maxHp,
        maxHp: maxHp,
        special_used: false,
        special_name: characterData.special_name,
        flavor_text: characterData.flavor_text,
        is_special: isSpecial,
        tier: characterData.tier || (isSpecial ? 'special' : 'student')
      });
    }
  }
  return selected;
}

function checkMinetaFilter(attacker, defender) {
  if (attacker.name === "Minoru Mineta" && defender.name === "Minoru Mineta") {
    return {
      instant_result: "draw",
      dialogue: [
        "Two Minetas face each other...",
        "WHAT THE HELL IS THIS?!",
        "I'M NOT WASTING MY TIME AND CODE ON THIS GRAPE-FLAVORED DUMPSTERFIRE!! EVERYONE GOES TO HELL!!"
      ]
    };
  } else if (attacker.name === "Minoru Mineta") {
    return {
      instant_result: "defender_wins",
      dialogue: [
        "Really?! This is what I get when I made this command?!",
        `${defender.name} doesn't even NEED to move!`,
        "HE LOSES BY JUST BEING HIMSELF! WHAT A DAMN EMBARRASSMENT!! SHOJI NO RESCUING HIM THIS TIME!!"
      ]
    };
  } else if (defender.name === "Minoru Mineta") {
    return {
      instant_result: "attacker_wins",
        dialogue: [
            "Mineta starts panicking and throws his sticky balls. Does this ever work? According to ChatGPT, the answer is NO!",
            `${attacker.name} and I are staring at this embarrassment while Mineta self-implodes because he remembered that Kenji Tsuragamae installed an ankle monitor—and he just triggered it.`,
            "I REALLY don't know what's a bigger mistake—letting Ocean make this a thing, or this whole damn battle!!"
        ]
    };
  }
  return null;
}

function checkCanonBattle(card1, card2) {
  const battleKey = `${card1} vs ${card2}`;
  const reverseBattleKey = `${card2} vs ${card1}`;
  
  if (canonBattles.battles[battleKey]) {
    return canonBattles.battles[battleKey];
  } else if (canonBattles.battles[reverseBattleKey]) {
    const reversed = canonBattles.battles[reverseBattleKey];
    if (reversed.winner === card1 || reversed.winner === card2) {
      return reversed;
    }
  }
  return null;
}

function formatBattleStart(playerTeam, bakugoTeam, mode) {
  let description = "**YOUR TEAM:**\n";
  playerTeam.forEach((card, i) => {
    const specialIndicator = card.is_special ? " ✨" : "";
    description += `${i + 1}. ${card.name}${specialIndicator} [Power: ${card.power}] [HP: ${card.hp}/${card.maxHp}]\n`;
  });
  
  if (mode === 1) {
    description += "\n**BAKUGO'S TEAM:**\n";
    bakugoTeam.forEach((card, i) => {
      const specialIndicator = card.is_special ? " ✨" : "";
      description += `${i + 1}. ${card.name}${specialIndicator} [Power: ${card.power}] [HP: ${card.hp}/${card.maxHp}]\n`;
    });
  } else if (mode === 2) {
    description += "\n**BAKUGO'S TEAM:**\n";
    bakugoTeam.forEach((card, i) => {
      const specialIndicator = card.is_special ? " ✨" : "";
      description += `${i + 1}. ${card.name}${specialIndicator} [HP: ???]\n`;
    });
  } else {
    description += "\n**BAKUGO'S TEAM:** Hidden\n";
  }
  
  // Only show legend if there are special characters
  const hasSpecial = [...playerTeam, ...bakugoTeam].some(card => card.is_special);
  if (hasSpecial) {
    description += "\n✨ = Special Character (Higher power, dies after one kill)";
  }
  
  return description;
}

function getDamageMessage(damage) {
  if (damage >= 10) return "💥 DEVASTATING HIT!";
  if (damage >= 7) return "Strong hit!";
  if (damage >= 4) return "Solid damage!";
  return "Weak hit...";
}

function getAliveCards(team) {
  return team.filter(card => card.hp > 0);
}

async function processTurn(msg, battle, channel) {
  const input = msg.content.toLowerCase();
  const batcher = new MessageBatcher(channel);
  
  // Check for surrender
  if (input === 'quit' || input === 'surrender' || input === 'forfeit' || input === 'give up') {
    const surrenderEmbed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('🏳️ COWARD! 🏳️')
      .setDescription("HAH! RUNNING AWAY ALREADY?! YOU'RE EVEN WEAKER THAN I THOUGHT!")
      .addFields({
        name: 'Bakugo Wins by Default',
        value: "You're even more pathetic than I thought! Can't even finish a fight!"
      })
      .setFooter({ text: 'Come back when you grow a spine, EXTRA!' });
    
    await channel.send({ embeds: [surrenderEmbed] });
    battle.finished = true;
    return;
  }
  
  if (battle.state === 'SELECT_CARD') {
    let selectedCard = null;
    const aliveCards = getAliveCards(battle.playerTeam);
    
    // Check if input is a number
    const cardNum = parseInt(input);
    if (!isNaN(cardNum) && cardNum >= 1 && cardNum <= aliveCards.length) {
      selectedCard = aliveCards[cardNum - 1];
    } else {
      // Check if input matches a card name
      selectedCard = aliveCards.find(card => 
        card.name.toLowerCase().includes(input)
      );
    }
    
    if (!selectedCard) {
      await channel.send("Invalid choice! Pick a valid card number or name from the ALIVE cards.");
      return;
    }
    
    battle.activePlayerCard = selectedCard;
    
    // Select Bakugo's card (first available)
    const aliveBakugoCards = getAliveCards(battle.bakugoTeam);
    battle.activeBakugoCard = aliveBakugoCards[0];
    
    // Check for instant wins (Mineta filter)
    const minetaCheck = checkMinetaFilter(battle.activePlayerCard, battle.activeBakugoCard);
    if (minetaCheck) {
      for (const line of minetaCheck.dialogue) {
        batcher.add(line);
      }
      await batcher.flush();
      
      if (minetaCheck.instant_result === "attacker_wins") {
        battle.activeBakugoCard.hp = 0;
      } else if (minetaCheck.instant_result === "defender_wins") {
        battle.activePlayerCard.hp = 0;
      }
      
      await checkBattleEnd(battle, channel);
      return;
    }
    
    // Check for canon battles
    const canonResult = checkCanonBattle(battle.activePlayerCard.name, battle.activeBakugoCard.name);
    if (canonResult) {
      for (const line of canonResult.dialogue) {
        batcher.add(line);
      }
      await batcher.flush();
      
      if (canonResult.winner === battle.activePlayerCard.name) {
        battle.activeBakugoCard.hp = 0;
      } else if (canonResult.winner === battle.activeBakugoCard.name) {
        battle.activePlayerCard.hp = 0;
      } else {
        battle.activePlayerCard.hp = 0;
        battle.activeBakugoCard.hp = 0;
      }
      
      await checkBattleEnd(battle, channel);
      return;
    }
    
    // Normal battle starts
    await showBattleStatus(battle, channel);
    
    // Check whose turn it is
    if (battle.turn === 'bakugo') {
      batcher.add("Bakugo attacks first!");
      await processBakugoAttack(battle, batcher);
      await batcher.flush();
      
      if (battle.activePlayerCard.hp <= 0) {
        await checkBattleEnd(battle, channel);
        return;
      }
      
      battle.turn = 'player';
      battle.state = 'CHOOSE_ACTION';
      await channel.send("Your turn! Type **attack** or **special**:");
    } else {
      battle.state = 'CHOOSE_ACTION';
      await channel.send("Your turn! Type **attack** or **special**:");
    }
    
  } else if (battle.state === 'CHOOSE_ACTION') {
    if (input === 'attack') {
      await processPlayerAttack(battle, batcher, 'normal');
    } else if (input === 'special') {
      if (battle.activePlayerCard.special_used) {
        await channel.send("You already used your special! Type **attack**: or you know you can just keep retrying special and burn time.");
        return;
      }
      await processPlayerAttack(battle, batcher, 'special');
    } else {
      await channel.send("Invalid action! Type **attack** or **special**: THIS ISN'T THAT HARD DUMBASS!");
      return;
    }
    
    await batcher.flush();
    
    if (battle.activeBakugoCard.hp <= 0) {
      await checkBattleEnd(battle, channel);
      return;
    }
    
    battle.turn = 'bakugo';
    batcher.add("Bakugo's turn!");
    await processBakugoAttack(battle, batcher);
    await batcher.flush();
    
    if (battle.activePlayerCard.hp <= 0) {
      await checkBattleEnd(battle, channel);
      return;
    }
    
    battle.turn = 'player';
    
    await showBattleStatus(battle, channel);
    await channel.send("Your turn! Type **attack** or **special**:");
  }
}

async function processPlayerAttack(battle, batcher, type) {
  const roll = rollDice();
  let damage = battle.activePlayerCard.power + roll;
  
  if (type === 'special') {
    batcher.add(`💥 ${battle.activePlayerCard.name} attempts **${battle.activePlayerCard.special_name}**! 💥`);
    batcher.add(`🎲 Rolling for special... ${roll}`);
    
    if (roll >= SPECIAL_SUCCESS_THRESHOLD) {
      damage = battle.activePlayerCard.power * SPECIAL_MULTIPLIER;
      batcher.add(`SUCCESS! ${battle.activePlayerCard.flavor_text}`);
      batcher.add(`Damage: ${battle.activePlayerCard.power} × ${SPECIAL_MULTIPLIER} = ${damage}!`);
    } else {
      batcher.add(`BACKFIRE! The special move failed!`);
      batcher.add(`${battle.activePlayerCard.name} takes ${RECOIL_DAMAGE} recoil damage!`);
      battle.activePlayerCard.hp -= RECOIL_DAMAGE;
      damage = 0;
    }
    battle.activePlayerCard.special_used = true;
  } else {
    batcher.add(`${battle.activePlayerCard.name} attacks!`);
    batcher.add(`🎲 Rolled: ${roll}`);
    batcher.add(`Damage: ${battle.activePlayerCard.power} + ${roll} = ${damage}`);
    batcher.add(getDamageMessage(damage));
  }
  
  if (damage > 0) {
    battle.activeBakugoCard.hp -= damage;
    if (battle.activeBakugoCard.hp < 0) battle.activeBakugoCard.hp = 0;
  }
}

async function processBakugoAttack(battle, batcher) {
  const roll = rollDice();
  const useSpecial = !battle.activeBakugoCard.special_used && Math.random() > 0.7;
  
  let damage = battle.activeBakugoCard.power + roll;
  
  if (useSpecial) {
    batcher.add(`💥 ${battle.activeBakugoCard.name} uses **${battle.activeBakugoCard.special_name}**! 💥`);
    batcher.add(`🎲 Rolling for special... ${roll}`);
    
    if (roll >= SPECIAL_SUCCESS_THRESHOLD) {
      damage = battle.activeBakugoCard.power * SPECIAL_MULTIPLIER;
      batcher.add(`SUCCESS! ${battle.activeBakugoCard.flavor_text}`);
      batcher.add(`Damage: ${damage}!`);
    } else {
      batcher.add(`BACKFIRE! Bakugo's fighter messed up! DAMN IT!`);
      battle.activeBakugoCard.hp -= RECOIL_DAMAGE;
      damage = 0;
    }
    battle.activeBakugoCard.special_used = true;
  } else {
    batcher.add(`${battle.activeBakugoCard.name} attacks!`);
    batcher.add(`🎲 Rolled: ${roll}`);
    batcher.add(`Damage: ${damage}`);
    batcher.add(getDamageMessage(damage));
  }
  
  if (damage > 0) {
    battle.activePlayerCard.hp -= damage;
    if (battle.activePlayerCard.hp < 0) battle.activePlayerCard.hp = 0;
  }
}

async function showBattleStatus(battle, channel) {
  const playerIndicator = battle.activePlayerCard.is_special ? " ✨" : "";
  const bakugoIndicator = battle.activeBakugoCard.is_special ? " ✨" : "";
  
  const embed = new EmbedBuilder()
    .setColor('Orange')
    .setTitle('⚔️ BATTLE STATUS ⚔️')
    .addFields(
      { 
        name: 'YOUR FIGHTER', 
        value: `${battle.activePlayerCard.name}${playerIndicator}\nHP: ${battle.activePlayerCard.hp}/${battle.activePlayerCard.maxHp}\nPower: ${battle.activePlayerCard.power}`,
        inline: true
      },
      {
        name: 'VS',
        value: '💥',
        inline: true
      },
      {
        name: "BAKUGO'S FIGHTER",
        value: battle.mode === 1 ? 
          `${battle.activeBakugoCard.name}${bakugoIndicator}\nHP: ${battle.activeBakugoCard.hp}/${battle.activeBakugoCard.maxHp}\nPower: ${battle.activeBakugoCard.power}` :
          `${battle.activeBakugoCard.name}${bakugoIndicator}\nHP: ???\nPower: ???`,
        inline: true
      }
    );
    
  await channel.send({ embeds: [embed] });
}

async function checkBattleEnd(battle, channel) {
  // Capture initial defeat states before any exhaustion happens
  const playerWasDefeated = battle.activePlayerCard.hp <= 0;
  const bakugoWasDefeated = battle.activeBakugoCard.hp <= 0;
  
  // Handle player defeat
  if (playerWasDefeated) {
    await channel.send(`💥 ${battle.activePlayerCard.name} is defeated!`);
    
    // If Bakugo's special character won, it exhausts and dies too
    if (battle.activeBakugoCard.is_special && battle.activeBakugoCard.hp > 0) {
      await channel.send(`⚡ ${battle.activeBakugoCard.name} exhausted their power and collapses! Special characters can only defeat one opponent!`);
      battle.activeBakugoCard.hp = 0;
    }
  }
  
  // Handle Bakugo defeat (only announce if they died from damage, not exhaustion)
  if (bakugoWasDefeated) {
    await channel.send(`💥 ${battle.activeBakugoCard.name} is defeated!`);
    
    // If player's special character won, it exhausts and dies too
    if (battle.activePlayerCard.is_special && battle.activePlayerCard.hp > 0) {
      await channel.send(`⚡ ${battle.activePlayerCard.name} exhausted their power and collapses! Special characters can only defeat one opponent!`);
      battle.activePlayerCard.hp = 0;
    }
  }
  
  // Re-check alive counts after special character deaths
  const playerStillAlive = getAliveCards(battle.playerTeam);
  const bakugoStillAlive = getAliveCards(battle.bakugoTeam);
  
  // Check for tie (both teams eliminated)
  if (playerStillAlive.length === 0 && bakugoStillAlive.length === 0) {
    const tieEmbed = new EmbedBuilder()
      .setColor('Yellow')
      .setTitle('💥 IT\'S A TIE! 💥')
      .setDescription("WHAT?! We both ran out of fighters at the same time?!")
      .addFields({
        name: 'Final Result',
        value: "Neither of us could claim victory! This isn't over!"
      })
      .setFooter({ text: 'A draw... how unsatisfying!' });
    
    await channel.send({ embeds: [tieEmbed] });
    battle.finished = true;
    return;
  }
  
  // Check if player lost all cards
  if (playerStillAlive.length === 0) {
    const winEmbed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('🏆 BAKUGO WINS! 🏆')
      .setDescription("HAH! I'M THE BEST!! YOU'RE JUST A WEAK EXTRA!")
      .addFields({
        name: 'Final Standing',
        value: `Bakugo's remaining fighters:\n${bakugoStillAlive.map(card => 
          `${card.name} [${card.hp}/${card.maxHp} HP]`).join('\n')}`
      })
      .setFooter({ text: 'Better luck next time, loser!' });
    
    await channel.send({ embeds: [winEmbed] });
    battle.finished = true;
    return;
  }
  
  // Check if Bakugo lost all cards
  if (bakugoStillAlive.length === 0) {
    const winEmbed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('🏆 YOU WIN! 🏆')
      .setDescription("Tch... You got lucky, that's all!")
      .addFields({
        name: 'Your Survivors',
        value: `${playerStillAlive.map(card => 
          `${card.name} [${card.hp}/${card.maxHp} HP]`).join('\n')}`
      })
      .setFooter({ text: "Don't get cocky! Next time I'll destroy you!" });
    
    await channel.send({ embeds: [winEmbed] });
    battle.finished = true;
    return;
  }
  
  // Battle continues - handle card selection
  
  // If player's card died, they need to select a new one
  if (battle.activePlayerCard.hp <= 0) {
    await channel.send("Choose your next fighter:");
    const available = playerStillAlive.map((card, i) => 
      `${i + 1}. ${card.name} [HP: ${card.hp}/${card.maxHp}]`
    ).join('\n');
    await channel.send(available);
    battle.state = 'SELECT_CARD';
  }
  
  // If Bakugo's card died, auto-select next one
  if (battle.activeBakugoCard.hp <= 0) {
    battle.activeBakugoCard = bakugoStillAlive[0];
    await channel.send(`Bakugo sends out ${battle.activeBakugoCard.name}! LETS GOOOO!`);
    
    // If player also needs to select (both died from special exhaustion), just wait
    if (battle.activePlayerCard.hp <= 0) {
      return;
    }
    
    // Otherwise, show battle status and continue
    await showBattleStatus(battle, channel);
    await channel.send("Your turn! Type **attack** or **special**:");
    battle.state = 'CHOOSE_ACTION';
    battle.turn = 'player';
  }
}

async function runBattle(channel, user, mode, cardCount, playerTeam = null, bakugoTeam = null) {
  // Initialize battle
  const finalPlayerTeam = playerTeam || assignRandomCards(cardCount);
  const finalBakugoTeam = bakugoTeam || assignRandomCards(cardCount);
  const turnOrder = rollDice();
  
  const battle = {
    playerTeam: finalPlayerTeam,
    bakugoTeam: finalBakugoTeam,
    mode,
    turn: turnOrder % 2 === 0 ? 'player' : 'bakugo',
    state: 'SELECT_CARD',
    activePlayerCard: null,
    activeBakugoCard: null,
    finished: false
  };
  
  await channel.send("🔥 **BAKUBATTLE BEGINS!** 🔥\nHAH! You think you can beat me?!");
  
  const embed = new EmbedBuilder()
    .setColor('Orange')
    .setTitle('Team Assignment')
    .setDescription(formatBattleStart(finalPlayerTeam, finalBakugoTeam, mode))
    .addFields({
      name: 'Turn Order',
      value: `Rolled ${turnOrder} - ${battle.turn === 'player' ? 'You go' : 'Bakugo goes'} first!`
    });
    
  await channel.send({ embeds: [embed] });
  await channel.send("Choose your fighter (number or name):");
  
  const filter = msg => msg.author.id === user.id && !msg.author.bot;
  const collector = channel.createMessageCollector({ filter, time: BATTLE_TIMEOUT });
  
  collector.on('collect', async msg => {
    if (!battle.finished) {
      await processTurn(msg, battle, channel);
      if (battle.finished) {
        collector.stop();
      }
    }
  });
  
  collector.on('end', collected => {
    if (!battle.finished) {
      channel.send("Battle timed out! Bakugo got bored and left. MAYBE NEXT TIME YOU'LL TYPE FASTER, EXTRA!");
    }
  });
}

module.exports = {
  name: 'bakubattle',
  description: 'Battle Bakugo with MHA characters!',
  category: 'Fun',
  aliases: ['battle', 'bakufight'],
  usage: '!bakubattle [mode] [cards]\n!bakubattle dev [mode] - Uses hardcoded test teams from code\nMode 1: Show all stats\nMode 2: Hide power levels\nMode 3: Hide opponent info\nCards: 1-3',
  legacy: true,
  devOnly: false,
  
  async execute({ message, args }) {
    // Check for dev mode
    /*
    if (args[0] === 'dev') {
      if (!global.config.devIDs.includes(message.author.id)) {
        return message.reply("YOU'RE NOT A DEV! NICE TRY, EXTRA!");
      }

      // Get mode from args or default to 1
      const mode = args[1] ? parseInt(args[1]) : 1;

      if (isNaN(mode) || mode < 1 || mode > 3) {
        return message.reply("Mode must be 1, 2, or 3! Usage: `!bakubattle dev [mode]`");
      }

      // Use hardcoded dev teams from top of file
      const playerCards = createDevCards(DEV_PLAYER_CARDS);
      const bakugoCards = createDevCards(DEV_BAKUGO_CARDS);

      if (playerCards.length === 0 || bakugoCards.length === 0) {
        return message.reply("Dev cards not found! Check the card names in DEV_PLAYER_CARDS and DEV_BAKUGO_CARDS at the top of the file.");
      }

      await message.channel.send("🔧 **DEV MODE ACTIVATED** 🔧\nUsing hardcoded test teams!");
      await runBattle(message.channel, message.author, mode, 0, playerCards, bakugoCards);
      return;
    }*/

    // Normal mode
    let mode, cardCount;

    if (!args.length) {
      mode = 1;
      cardCount = 3;
    } else {
      mode = parseInt(args[0]);
      cardCount = parseInt(args[1]);
    }
    
    if (isNaN(mode)) {
      return message.reply("THIS ISN'T YOUR FANFICTION WORLD, DIPSHIT!! PICK A VALID NUMBER FOR A MODE! 1 OR 2 OR 3! NOT A RANDOM WORD, OBJECT, OR ARRAY, OR WHATEVER ELSE CHATGPT SUGGESTED! IT'S JUST AN AI WITHOUT A BRAINCELL! GENERATIVE AI—NOT ACTUAL BRAIN! ...Actually, ChatGPT might understand the instructions better than you. Give *them* the device.");
    }
    if (isNaN(cardCount)) {
      return message.reply("I honestly have nothing to say if you can't count to 3. I'll help you out. ONE. TWO. THREE! IT'S NOT THAT HARD! LET ME GUESS—YOUR ELEMENTARY REPORT CARD HAD F'S, DIDN'T IT?! DO YOU EVEN KNOW WHAT THAT MEANS?! IT MEANS YOU FAILED! YOU FAILED AT COUNTING! YOU FAILED AT LIFE! YOU FAILED AT EVERYTHING! I'M NOT EVEN MAD, I'M JUST DISAPPOINTED! I'M NOT YOUR PARENT, BUT I FEEL LIKE I SHOULD BE!");
    }

    if (mode < 1 || mode > 3) {
      return message.reply("Mode must be 1, 2, or 3! Try again, extra! Im not gonna start letting you invent modes! I DON'T HAVE TIME FOR THAT!");
    }
    
    if (cardCount < 1 || cardCount > 3) {
      return message.reply("Cards must be between 1 and 3! Can't you count?! Seriously did the elementary school give up? Actually now that I think about it.... I don't blame them");
    }
    
    await runBattle(message.channel, message.author, mode, cardCount);
  }
};