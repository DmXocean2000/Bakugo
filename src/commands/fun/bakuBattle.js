const { EmbedBuilder } = require('discord.js');
const cards = require('../../jsons/cards.json');
const canonBattles = require('../../jsons/canon_battles.json');

// Battle constants
const SPECIAL_SUCCESS_THRESHOLD = 4;
const SPECIAL_MULTIPLIER = 3;
const RECOIL_DAMAGE = 5;
const HP_MULTIPLIER = 10;
const BATTLE_TIMEOUT = 300000; // 5 minutes

// Utility functions
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollDice() {
  return randInt(1, 6);
}

function assignRandomCards(count) {
  const allStudents = Object.keys(cards.students);
  const selected = [];
  const used = new Set();
  
  while (selected.length < count) {
    const randomIndex = Math.floor(Math.random() * allStudents.length);
    const student = allStudents[randomIndex];
    if (!used.has(student)) {
      used.add(student);
      const power = randInt(1, 3);
      const maxHp = power * HP_MULTIPLIER;
      selected.push({
        name: student,
        power: power,
        hp: maxHp,
        maxHp: maxHp,
        special_used: false,
        special_name: cards.students[student].special_name,
        flavor_text: cards.students[student].flavor_text
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
            "I REALLY don’t know what’s a bigger mistake—letting Ocean make this a thing, or this whole damn battle!!"
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
    // Reverse the winner if checking opposite order
    if (reversed.winner === card1 || reversed.winner === card2) {
      return reversed;
    }
  }
  return null;
}

function formatBattleStart(playerTeam, bakugoTeam, mode) {
  let description = "**YOUR TEAM:**\n";
  playerTeam.forEach((card, i) => {
    description += `${i + 1}. ${card.name} [Power: ${card.power}] [HP: ${card.hp}/${card.maxHp}]\n`;
  });
  
  if (mode === 1) {
    description += "\n**BAKUGO'S TEAM:**\n";
    bakugoTeam.forEach((card, i) => {
      description += `${i + 1}. ${card.name} [Power: ${card.power}] [HP: ${card.hp}/${card.maxHp}]\n`;
    });
  } else if (mode === 2) {
    description += "\n**BAKUGO'S TEAM:**\n";
    bakugoTeam.forEach((card, i) => {
      description += `${i + 1}. ${card.name} [HP: ???]\n`;
    });
  } else {
    description += "\n**BAKUGO'S TEAM:** Hidden\n";
  }
  
  return description;
}

function getDamageMessage(damage) {
  if (damage >= 10) return "💥 DEVASTATING HIT!";
  if (damage >= 7) return "Strong hit!";
  if (damage >= 4) return "Solid damage!";
  return "Weak hit...";
}

async function processTurn(msg, battle, channel) {
  const input = msg.content.toLowerCase();
  
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
    
    // Check if input is a number
    const cardNum = parseInt(input);
    if (!isNaN(cardNum) && cardNum >= 1 && cardNum <= battle.playerTeam.length) {
      selectedCard = battle.playerTeam[cardNum - 1];
    } else {
      // Check if input matches a card name
      selectedCard = battle.playerTeam.find(card => 
        card.name.toLowerCase().includes(input) && card.hp > 0
      );
    }
    
    // Extra validation - make sure the selected card has HP
    if (selectedCard && selectedCard.hp <= 0) {
      selectedCard = null;
    }
    
    if (!selectedCard || selectedCard.hp <= 0) {
      await channel.send("Invalid choice! Pick a valid card number or name.");
      return;
    }
    
    battle.activePlayerCard = selectedCard;
    battle.state = 'BATTLE_PHASE';
    
    // Select Bakugo's card (first available)
    battle.activeBakugoCard = battle.bakugoTeam.find(card => card.hp > 0);
    
    // Check for instant wins (Mineta filter)
    const minetaCheck = checkMinetaFilter(battle.activePlayerCard, battle.activeBakugoCard);
    if (minetaCheck) {
      for (const line of minetaCheck.dialogue) {
        await channel.send(line);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
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
        await channel.send(line);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (canonResult.winner === battle.activePlayerCard.name) {
        battle.activeBakugoCard.hp = 0;
      } else if (canonResult.winner === battle.activeBakugoCard.name) {
        battle.activePlayerCard.hp = 0;
      } else {
        // Draw
        battle.activePlayerCard.hp = 0;
        battle.activeBakugoCard.hp = 0;
      }
      
      await checkBattleEnd(battle, channel);
      return;
    }
    
    // Normal battle starts
    await showBattleStatus(battle, channel);
    
    // If Bakugo goes first
    if (battle.turn === 'bakugo') {
      await processBakugoAttack(battle, channel);
      if (battle.activePlayerCard.hp <= 0) {
        await checkBattleEnd(battle, channel);
        return;
      }
    }
    
    await channel.send("Your turn! Type **attack** or **special**:");
    battle.state = 'CHOOSE_ACTION';
    
  } else if (battle.state === 'CHOOSE_ACTION') {
    if (input === 'attack') {
      await processPlayerAttack(battle, channel, 'normal');
    } else if (input === 'special') {
      if (battle.activePlayerCard.special_used) {
        await channel.send("You already used your special! Type **attack**: or you know you can just keep retrying special and burn time.");
        return;
      }
      await processPlayerAttack(battle, channel, 'special');
    } else {
      await channel.send("Invalid action! Type **attack** or **special**: THIS ISN'T THAT HARD DUMBASS!");
      return;
    }
    
    // Check if Bakugo's card is defeated
    if (battle.activeBakugoCard.hp <= 0) {
      await checkBattleEnd(battle, channel);
      return;
    }
    
    // Bakugo's turn
    await processBakugoAttack(battle, channel);
    
    // Check if player's card is defeated
    if (battle.activePlayerCard.hp <= 0) {
      await checkBattleEnd(battle, channel);
      return;
    }
    
    // Continue battle
    await showBattleStatus(battle, channel);
    await channel.send("Your turn! Type **attack** or **special**:");
  }
}

async function processPlayerAttack(battle, channel, type) {
  const roll = rollDice();
  let damage = battle.activePlayerCard.power + roll;
  let message = `${battle.activePlayerCard.name} attacks!\n🎲 Rolled: ${roll}\n`;
  
  if (type === 'special') {
    message = `💥 ${battle.activePlayerCard.name} attempts **${battle.activePlayerCard.special_name}**! 💥\n`;
    message += `🎲 Rolling for special... ${roll}\n\n`;
    
    if (roll >= SPECIAL_SUCCESS_THRESHOLD) {
      damage = battle.activePlayerCard.power * SPECIAL_MULTIPLIER;
      message += `SUCCESS! ${battle.activePlayerCard.flavor_text}\n`;
      message += `Damage: ${battle.activePlayerCard.power} × ${SPECIAL_MULTIPLIER} = ${damage}!\n`;
    } else {
      message += `BACKFIRE! The special move failed!\n`;
      message += `${battle.activePlayerCard.name} takes ${RECOIL_DAMAGE} recoil damage!\n`;
      battle.activePlayerCard.hp -= RECOIL_DAMAGE;
      damage = 0;
    }
    battle.activePlayerCard.special_used = true;
  } else {
    message += `Damage: ${battle.activePlayerCard.power} + ${roll} = ${damage}\n`;
    message += getDamageMessage(damage);
  }
  
  if (damage > 0) {
    battle.activeBakugoCard.hp -= damage;
    if (battle.activeBakugoCard.hp < 0) battle.activeBakugoCard.hp = 0;
  }
  
  await channel.send(message);
}

async function processBakugoAttack(battle, channel) {
  const roll = rollDice();
  const useSpecial = !battle.activeBakugoCard.special_used && Math.random() > 0.7;
  
  let damage = battle.activeBakugoCard.power + roll;
  let message = "";
  
  if (useSpecial) {
    message = `💥 ${battle.activeBakugoCard.name} uses **${battle.activeBakugoCard.special_name}**! 💥\n`;
    message += `🎲 Rolling for special... ${roll}\n\n`;
    
    if (roll >= SPECIAL_SUCCESS_THRESHOLD) {
      damage = battle.activeBakugoCard.power * SPECIAL_MULTIPLIER;
      message += `SUCCESS! ${battle.activeBakugoCard.flavor_text}\n`;
      message += `Damage: ${damage}!\n`;
    } else {
      message += `BACKFIRE! Bakugo's fighter messed up! DAMN IT!\n`;
      battle.activeBakugoCard.hp -= RECOIL_DAMAGE;
      damage = 0;
    }
    battle.activeBakugoCard.special_used = true;
  } else {
    message = `${battle.activeBakugoCard.name} attacks!\n`;
    message += `🎲 Rolled: ${roll}\n`;
    message += `Damage: ${damage}\n`;
    message += getDamageMessage(damage);
  }
  
  if (damage > 0) {
    battle.activePlayerCard.hp -= damage;
    if (battle.activePlayerCard.hp < 0) battle.activePlayerCard.hp = 0;
  }
  
  await channel.send(message);
}

async function showBattleStatus(battle, channel) {
  const embed = new EmbedBuilder()
    .setColor('Orange')
    .setTitle('⚔️ BATTLE STATUS ⚔️')
    .addFields(
      { 
        name: 'YOUR FIGHTER', 
        value: `${battle.activePlayerCard.name}\nHP: ${battle.activePlayerCard.hp}/${battle.activePlayerCard.maxHp}\nPower: ${battle.activePlayerCard.power}`,
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
          `${battle.activeBakugoCard.name}\nHP: ${battle.activeBakugoCard.hp}/${battle.activeBakugoCard.maxHp}\nPower: ${battle.activeBakugoCard.power}` :
          `${battle.activeBakugoCard.name}\nHP: ???\nPower: ???`,
        inline: true
      }
    );
    
  await channel.send({ embeds: [embed] });
}

async function checkBattleEnd(battle, channel) {
  const playerAlive = battle.playerTeam.filter(card => card.hp > 0);
  const bakugoAlive = battle.bakugoTeam.filter(card => card.hp > 0);
  
  if (battle.activePlayerCard.hp <= 0) {
    await channel.send(`💥 ${battle.activePlayerCard.name} is defeated!`);
    
    if (playerAlive.length === 0) {
      const winEmbed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('🏆 BAKUGO WINS! 🏆')
        .setDescription("HAH! I'M THE BEST!! YOU'RE JUST A WEAK EXTRA!")
        .addFields({
          name: 'Final Standing',
          value: `Bakugo's remaining fighters:\n${bakugoAlive.map(card => 
            `${card.name} [${card.hp}/${card.maxHp} HP]`).join('\n')}`
        })
        .setFooter({ text: 'Better luck next time, loser!' });
      
      await channel.send({ embeds: [winEmbed] });
      battle.finished = true;
      return;
    }
    
    await channel.send("Choose your next fighter:");
    const available = battle.playerTeam.map((card, i) => 
      card.hp > 0 ? `${i + 1}. ${card.name} [HP: ${card.hp}/${card.maxHp}]` : null
    ).filter(x => x).join('\n');
    await channel.send(available);
    battle.state = 'SELECT_CARD';
  }
  
  if (battle.activeBakugoCard.hp <= 0) {
    await channel.send(`💥 ${battle.activeBakugoCard.name} is defeated!`);
    
    if (bakugoAlive.length === 0) {
      const winEmbed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('🏆 YOU WIN! 🏆')
        .setDescription("Tch... You got lucky, that's all!")
        .addFields({
          name: 'Your Survivors',
          value: `${playerAlive.map(card => 
            `${card.name} [${card.hp}/${card.maxHp} HP]`).join('\n')}`
        })
        .setFooter({ text: "Don't get cocky! Next time I'll destroy you!" });
      
      await channel.send({ embeds: [winEmbed] });
      battle.finished = true;
      return;
    }
    
    // Auto-select next Bakugo card
    battle.activeBakugoCard = bakugoAlive[0];
    await channel.send(`Bakugo sends out ${battle.activeBakugoCard.name}! LETS GOOOO!`);
    
    // Show battle status for the new matchup
    await showBattleStatus(battle, channel);
    await channel.send("Your turn! Type **attack** or **special**:");
  }
}

async function runBattle(channel, user, mode, cardCount) {
  // Initialize battle
  const playerTeam = assignRandomCards(cardCount);
  const bakugoTeam = assignRandomCards(cardCount);
  const turnOrder = rollDice();
  
  const battle = {
    playerTeam,
    bakugoTeam,
    mode,
    turn: turnOrder % 2 === 0 ? 'player' : 'bakugo',
    state: 'SELECT_CARD',
    activePlayerCard: null,
    activeBakugoCard: null,
    finished: false
  };
  
  // Opening message
  await channel.send("🔥 **BAKUBATTLE BEGINS!** 🔥\nHAH! You think you can beat me?!");
  
  const embed = new EmbedBuilder()
    .setColor('Orange')
    .setTitle('Team Assignment')
    .setDescription(formatBattleStart(playerTeam, bakugoTeam, mode))
    .addFields({
      name: 'Turn Order',
      value: `Rolled ${turnOrder} - ${battle.turn === 'player' ? 'You go' : 'Bakugo goes'} first!`
    });
    
  await channel.send({ embeds: [embed] });
  await channel.send("Choose your fighter (number or name):");
  
  // Create message collector
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
  usage: '!bakubattle [mode] [cards]\nMode 1: Show all stats\nMode 2: Hide power levels\nMode 3: Hide opponent info\nCards: 1-3',
  legacy: true,
  
  async execute({ message, args }) {
        let mode, cardCount;

    // No args provided — use defaults
    if (!args.length) {
      mode = 1;
      cardCount = 3;
    } else {
      // Try to parse provided values
      mode = parseInt(args[0]);
      cardCount = parseInt(args[1]);
    }
    // Validate inputs
    if (isNaN(mode)) {
      return message.reply("THIS ISN’T YOUR FANFICTION WORLD, DIPSHIT!! PICK A VALID NUMBER FOR A MODE! 1 OR 2 OR 3! NOT A RANDOM WORD, OBJECT, OR ARRAY, OR WHATEVER ELSE CHATGPT SUGGESTED! IT’S JUST AN AI WITHOUT A BRAINCELL! GENERATIVE AI—NOT ACTUAL BRAIN! ...Actually, ChatGPT might understand the instructions better than you. Give *them* the device.");
    }
    if (isNaN(cardCount)) {
      return message.reply("I honestly have nothing to say if you can't count to 3. I'll help you out. ONE. TWO. THREE! IT’S NOT THAT HARD! LET ME GUESS—YOUR ELEMENTARY REPORT CARD HAD F’S, DIDN’T IT?! DO YOU EVEN KNOW WHAT THAT MEANS?! IT MEANS YOU FAILED! YOU FAILED AT COUNTING! YOU FAILED AT LIFE! YOU FAILED AT EVERYTHING! I’M NOT EVEN MAD, I’M JUST DISAPPOINTED! I’M NOT YOUR PARENT, BUT I FEEL LIKE I SHOULD BE!");
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