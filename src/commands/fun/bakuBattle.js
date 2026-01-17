const { EmbedBuilder } = require('discord.js');
const cards = require('../../jsons/cards.json');
const canonBattles = require('../../jsons/canon_battles.json');

// ==================== CONSTANTS ====================
const CONFIG = {
  SPECIAL_MULTIPLIER: 3,
  RECOIL_DAMAGE: 5,
  HP_MULTIPLIER: 10,
  BATTLE_TIMEOUT: 300000,
  MAX_MESSAGE_LENGTH: 1900,
  ULTIMATE_THRESHOLD: 5,
  ULTIMATE_MULTIPLIER: 10,
  ULTIMATE_RECOIL: 15,
  SPECIAL_SPAWN_RATE: 0.1, // 10%
  SPECIAL_POWER_RANGE: [2, 4],
  STUDENT_POWER_RANGE: [1, 3],
  BAKUGO_ULTIMATE_CHANCE: 0.15, // 15% chance
  BAKUGO_SPECIAL_CHANCE: 0.30  // 30% chance
};

const SPECIAL_THRESHOLDS = [4, 5, 6, 7]; // 4+, 5+, 6, auto-fail

// DEV MODE TEST TEAMS - Edit these to test specific cards
const DEV_PLAYER_CARDS = [
  { name: "Shoto Todoroki", power: 2 },
  { name: "Izuku Midoriya", power: 2 },
  { name: "Katsuki Bakugo", power: 2 }
];

const DEV_BAKUGO_CARDS = [
  { name: "Minoru Mineta", power: 2 },
  { name: "Denki Kaminari", power: 2 },
  { name: "Mashirao Ojiro", power: 2 }
];

// ==================== UTILITIES ====================
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const rollDice = () => randInt(1, 6);
const getAliveCards = team => team.filter(card => card.hp > 0);
const canUseUltimate = card => !card.ultimate_used && card.hp <= (card.maxHp / 2);
const getSpecialThreshold = attempts => SPECIAL_THRESHOLDS[Math.min(attempts, 3)];

const getDamageMessage = damage => {
  if (damage >= 10) return "💥 DEVASTATING HIT!";
  if (damage >= 7) return "Strong hit!";
  if (damage >= 4) return "Solid damage!";
  return "Weak hit...";
};

// ==================== MESSAGE BATCHER ====================
class MessageBatcher {
  constructor(channel) {
    this.channel = channel;
    this.buffer = [];
    this.currentMessage = '';
  }

  add(text) {
    if (this.currentMessage.length + text.length + 1 > CONFIG.MAX_MESSAGE_LENGTH) {
      this.buffer.push(this.currentMessage);
      this.currentMessage = text;
    } else {
      this.currentMessage += (this.currentMessage ? '\n' : '') + text;
    }
  }

  async flush() {
    if (this.currentMessage) {
      this.buffer.push(this.currentMessage);
      this.currentMessage = '';
    }
    for (const msg of this.buffer) {
      await this.channel.send(msg);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    this.buffer = [];
  }
}

// ==================== CARD MANAGEMENT ====================
function createCard(name, isSpecial) {
  const characterData = isSpecial ? cards.special_characters[name] : cards.students[name];
  const powerRange = isSpecial ? CONFIG.SPECIAL_POWER_RANGE : CONFIG.STUDENT_POWER_RANGE;
  const power = randInt(...powerRange);
  const maxHp = power * CONFIG.HP_MULTIPLIER;
  
  return {
    name,
    power,
    hp: maxHp,
    maxHp,
    special_attempts: 0,
    ultimate_used: false,
    special_name: characterData.special_name,
    flavor_text: characterData.flavor_text,
    is_special: isSpecial,
    tier: characterData.tier || (isSpecial ? 'special' : 'student')
  };
}

function assignRandomCards(count) {
  const allStudents = Object.keys(cards.students);
  const allSpecial = cards.special_characters ? Object.keys(cards.special_characters) : [];
  const selected = [];
  const used = new Set();
  
  while (selected.length < count) {
    const isSpecial = Math.random() < CONFIG.SPECIAL_SPAWN_RATE && allSpecial.length > 0;
    const pool = isSpecial ? allSpecial : allStudents;
    const character = pool[Math.floor(Math.random() * pool.length)];
    
    if (!used.has(character)) {
      used.add(character);
      selected.push(createCard(character, isSpecial));
    }
  }
  return selected;
}

function createDevCards(devCardArray) {
  return devCardArray.map(({ name, power }) => {
    const isSpecial = cards.special_characters && cards.special_characters[name];
    const characterData = isSpecial ? cards.special_characters[name] : cards.students[name];
    const maxHp = power * CONFIG.HP_MULTIPLIER;
    
    return {
      name,
      power,
      hp: maxHp,
      maxHp,
      special_attempts: 0,
      ultimate_used: false,
      special_name: characterData.special_name,
      flavor_text: characterData.flavor_text,
      is_special: isSpecial,
      tier: characterData.tier || (isSpecial ? 'special' : 'student')
    };
  });
}

// ==================== SPECIAL BATTLE RULES ====================
const MINETA_RULES = {
  'Minoru Mineta vs Minoru Mineta': {
    result: 'draw',
    dialogue: [
            "Two Minetas face each other...",
      "OCEAN GET OVER HERE!!!! WHAT THE HELL IS THIS?!",
      "I'M NOT WASTING MY TIME AND CODE AND COMPUTE SPACE ON THIS GRAPE-FLAVORED DUMPSTERFIRE!!",
      "You know what? SCREW IT! They're both disqualified for crimes against humanity!",
      "Take good notes users, this is what happens when YOU DON'T KNOW WHAT NO MEANS!",
      "EVERYONE GOES TO HELL!!",
      "Ocean owes me a Dr Pepper for this!",
      "Screw it! Im taking it from Claude. Not like that bot needs it. It has 100 billion weights anyway!"
    ]
  },
  'Minoru Mineta vs *': {
    result: 'defender_wins',
    dialogue: (defender) => [
      "Oh COME ON! Really?! THIS is what I get for making this command?!",
      `${defender} doesn't even NEED to lift a finger!`,
      "Mineta trips over his excuses and knocks himself out! What a joke of a character!",
      "You deserve this honestly.",
      "HE LOSES BY JUST BEING HIMSELF! WHAT A DAMN EMBARRASSMENT!!",
      "SHOJI DO NOT RESCUING HIM THIS TIME!! I'M NOT EITHER!!",
      "Also. Ocean! Im COMING FOR YOU NEXT FOR MAKING THIS STUPID COMMAND!!",
    ]
  },
  '* vs Minoru Mineta': {
    result: 'attacker_wins',
    dialogue: (attacker) => [
            "Mineta starts panicking and throws his sticky balls. Does this ever work? According to ChatGPT, the answer is NO!",
      "Claude would also like to point out that this is an insane waste of code and compute resources.",
      `${attacker} and I are just... staring at this absolute trainwreck.`,
      "Sipping Dr pepper and waiting for it to end.",
      "OH WAIT—Mineta just remembered Kenji Tsuragamae installed an ankle monitor on him!",
      "BEEP BEEP BEEP Aaaaaand he just triggered it. Perfect.",
      "Mineta is escorted out by the police. Well, that was easy.",
      "I think I hear Jiro laughing. Hell yeah. at least something is done right.",
      "I REALLY don't know what's a bigger mistake—letting Ocean make this a thing, or this whole damn battle!!",
      "I can't believe I have to deal with THIS garbage! Ocean, you're dead to me!"
    ]
  }
};

function checkMinetaFilter(attacker, defender) {
  if (attacker.name === "Minoru Mineta" && defender.name === "Minoru Mineta") {
    return { instant_result: "draw", dialogue: MINETA_RULES['Minoru Mineta vs Minoru Mineta'].dialogue };
  }
  if (attacker.name === "Minoru Mineta") {
    return { instant_result: "defender_wins", dialogue: MINETA_RULES['Minoru Mineta vs *'].dialogue(defender.name) };
  }
  if (defender.name === "Minoru Mineta") {
    return { instant_result: "attacker_wins", dialogue: MINETA_RULES['* vs Minoru Mineta'].dialogue(attacker.name) };
  }
  return null;
}

function checkCanonBattle(card1, card2) {
  const battleKey = `${card1} vs ${card2}`;
  const reverseBattleKey = `${card2} vs ${card1}`;
  return canonBattles.battles[battleKey] || canonBattles.battles[reverseBattleKey] || null;
}

// ==================== COMBAT SYSTEM ====================
class CombatSystem {
  static attack(attacker, defender, batcher, type = 'normal') {
    const roll = rollDice();
    let damage;
    
    if (type === 'ultimate') {
      damage = CombatSystem.handleUltimate(attacker, roll, batcher);
    } else if (type === 'special') {
      damage = CombatSystem.handleSpecial(attacker, roll, batcher);
    } else {
      damage = CombatSystem.handleNormal(attacker, roll, batcher);
    }
    
    if (damage > 0) {
      defender.hp = Math.max(0, defender.hp - damage);
    }
  }
  
  static handleUltimate(attacker, roll, batcher) {
    batcher.add(`⚡💥 ${attacker.name} unleashes their ULTIMATE ATTACK! 💥⚡`);
    batcher.add(`🎲 Rolling for ultimate... ${roll}`);
    
    if (roll >= CONFIG.ULTIMATE_THRESHOLD) {
      const damage = attacker.power * CONFIG.ULTIMATE_MULTIPLIER;
      batcher.add(`🔥 ULTIMATE SUCCESS! 🔥`);
      batcher.add(`THIS IS IT! ALL OR NOTHING!`);
      batcher.add(`Damage: ${attacker.power} × ${CONFIG.ULTIMATE_MULTIPLIER} = ${damage}!`);
      attacker.ultimate_used = true;
      return damage;
    } else {
      batcher.add(`💀 ULTIMATE BACKFIRE! 💀`);
      batcher.add(`The ultimate attack failed catastrophically!`);
      batcher.add(`${attacker.name} takes ${CONFIG.ULTIMATE_RECOIL} recoil damage!`);
      attacker.hp = Math.max(0, attacker.hp - CONFIG.ULTIMATE_RECOIL);
      attacker.ultimate_used = true;
      return 0;
    }
  }
  
  static handleSpecial(attacker, roll, batcher) {
    const threshold = getSpecialThreshold(attacker.special_attempts);
    const attemptNum = attacker.special_attempts + 1;
    
    batcher.add(`💥 ${attacker.name} attempts **${attacker.special_name}**! (Attempt #${attemptNum}) 💥`);
    batcher.add(`🎲 Rolling for special... ${roll} (Need ${threshold}+)`);
    
    if (roll >= threshold) {
      const damage = attacker.power * CONFIG.SPECIAL_MULTIPLIER;
      batcher.add(`SUCCESS! ${attacker.flavor_text}`);
      batcher.add(`Damage: ${attacker.power} × ${CONFIG.SPECIAL_MULTIPLIER} = ${damage}!`);
      attacker.special_attempts++;
      return damage;
    } else {
      batcher.add(`BACKFIRE! The special move failed!`);
      if (threshold >= 7) batcher.add(`You've tried too many times! Automatic failure!`);
      batcher.add(`${attacker.name} takes ${CONFIG.RECOIL_DAMAGE} recoil damage!`);
      attacker.hp = Math.max(0, attacker.hp - CONFIG.RECOIL_DAMAGE);
      attacker.special_attempts++;
      return 0;
    }
  }
  
  static handleNormal(attacker, roll, batcher) {
    const damage = attacker.power + roll;
    batcher.add(`${attacker.name} attacks!`);
    batcher.add(`🎲 Rolled: ${roll}`);
    batcher.add(`Damage: ${attacker.power} + ${roll} = ${damage}`);
    batcher.add(getDamageMessage(damage));
    return damage;
  }
}

// ==================== UI HELPERS ====================
function formatBattleStart(playerTeam, bakugoTeam, mode) {
  const formatTeam = (team, label) => {
    let str = `**${label}:**\n`;
    team.forEach((card, i) => {
      const special = card.is_special ? " ✨" : "";
      let stats;
      if (mode === 3 && label.includes('BAKUGO')) {
        stats = "[HP: ???]";
      } else if (mode === 2 && label.includes('BAKUGO')) {
        stats = `[HP: ${card.hp}/${card.maxHp}]`;
      } else {
        stats = `[Power: ${card.power}] [HP: ${card.hp}/${card.maxHp}]`;
      }
      str += `${i + 1}. ${card.name}${special} ${stats}\n`;
    });
    return str;
  };
  
  let description = formatTeam(playerTeam, 'YOUR TEAM');
  description += mode === 3 ? "\n**BAKUGO'S TEAM:** Hidden\n" : formatTeam(bakugoTeam, "BAKUGO'S TEAM");
  
  const hasSpecial = [...playerTeam, ...bakugoTeam].some(card => card.is_special);
  if (hasSpecial) {
    description += "\n✨ = Special Character (Higher power, dies after one kill)";
  }
  
  return description;
}

function createBattleStatusEmbed(battle) {
  const formatFighter = (card, showStats) => {
    const special = card.is_special ? " ✨" : "";
    const ultimate = canUseUltimate(card) ? " ⚡" : "";
    return showStats ? 
      `${card.name}${special}${ultimate}\nHP: ${card.hp}/${card.maxHp}\nPower: ${card.power}\nSpecial Attempts: ${card.special_attempts}` :
      `${card.name}${special}${ultimate}\nHP: ???\nPower: ???`;
  };
  
  const embed = new EmbedBuilder()
    .setColor('Orange')
    .setTitle('⚔️ BATTLE STATUS ⚔️')
    .addFields(
      { name: 'YOUR FIGHTER', value: formatFighter(battle.activePlayerCard, true), inline: true },
      { name: 'VS', value: '💥', inline: true },
      { name: "BAKUGO'S FIGHTER", value: formatFighter(battle.activeBakugoCard, battle.mode === 1), inline: true }
    );
  
  if (canUseUltimate(battle.activePlayerCard) || canUseUltimate(battle.activeBakugoCard)) {
    embed.setFooter({ text: '⚡ = Ultimate Available (HP ≤ 50%)' });
  }
  
  return embed;
}

// ==================== BATTLE STATE MACHINE ====================
class BattleStateMachine {
  constructor(battle, channel) {
    this.battle = battle;
    this.channel = channel;
  }
  
  async handleInput(input) {
    if (this.battle.processing) return;
    this.battle.processing = true;
    
    try {
      if (['quit', 'surrender', 'forfeit', 'give up'].includes(input)) {
        await this.handleSurrender();
        return;
      }
      
      if (this.battle.state === 'SELECT_CARD') {
        await this.handleCardSelection(input);
      } else if (this.battle.state === 'CHOOSE_ACTION') {
        await this.handleAction(input);
      }
    } finally {
      this.battle.processing = false;
    }
  }
  
  async handleSurrender() {
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('🏳️ COWARD! 🏳️')
      .setDescription("HAH! RUNNING AWAY ALREADY?! YOU'RE EVEN WEAKER THAN I THOUGHT!")
      .addFields({ name: 'Bakugo Wins by Default', value: "You're even more pathetic than I thought! Can't even finish a fight!" })
      .setFooter({ text: 'Come back when you grow a spine, EXTRA!' });
    
    await this.channel.send({ embeds: [embed] });
    this.battle.finished = true;
  }
  
  async handleCardSelection(input) {
    const aliveCards = getAliveCards(this.battle.playerTeam);
    const cardNum = parseInt(input);
    const selectedCard = !isNaN(cardNum) && cardNum >= 1 && cardNum <= aliveCards.length ?
      aliveCards[cardNum - 1] :
      aliveCards.find(card => card.name.toLowerCase().includes(input));
    
    if (!selectedCard) {
      await this.channel.send("Invalid choice! Pick a valid card number or name from the ALIVE cards.");
      return;
    }
    
    this.battle.activePlayerCard = selectedCard;
    
    // If Bakugo doesn't have an active card, select one
    if (!this.battle.activeBakugoCard || this.battle.activeBakugoCard.hp <= 0) {
      const aliveBakugoCards = getAliveCards(this.battle.bakugoTeam);
      this.battle.activeBakugoCard = aliveBakugoCards[0];
      await this.channel.send(`Bakugo sends out ${this.battle.activeBakugoCard.name}! LETS GOOOO!`);
    }
    
    // Check special battle conditions with the new matchup
    const minetaCheck = checkMinetaFilter(this.battle.activePlayerCard, this.battle.activeBakugoCard);
    if (minetaCheck) {
      await this.handleInstantBattle(minetaCheck);
      return;
    }
    
    const canonResult = checkCanonBattle(this.battle.activePlayerCard.name, this.battle.activeBakugoCard.name);
    if (canonResult) {
      await this.handleCanonBattle(canonResult);
      return;
    }
    
    await this.startNormalBattle();
  }
  
  async handleInstantBattle(result) {
    const batcher = new MessageBatcher(this.channel);
    result.dialogue.forEach(line => batcher.add(line));
    await batcher.flush();
    
    if (result.instant_result === "attacker_wins") {
      this.battle.activeBakugoCard.hp = 0;
    } else if (result.instant_result === "defender_wins") {
      this.battle.activePlayerCard.hp = 0;
    } else if (result.instant_result === "draw") {
      // Both die
      this.battle.activePlayerCard.hp = 0;
      this.battle.activeBakugoCard.hp = 0;
    }
    
    await this.checkBattleEnd();
  }
  
  async handleCanonBattle(result) {
    const batcher = new MessageBatcher(this.channel);
    result.dialogue.forEach(line => batcher.add(line));
    await batcher.flush();
    
    if (result.winner === this.battle.activePlayerCard.name) {
      this.battle.activeBakugoCard.hp = 0;
    } else if (result.winner === this.battle.activeBakugoCard.name) {
      this.battle.activePlayerCard.hp = 0;
    } else {
      this.battle.activePlayerCard.hp = 0;
      this.battle.activeBakugoCard.hp = 0;
    }
    
    await this.checkBattleEnd();
  }
  
  async startNormalBattle() {
    await this.channel.send({ embeds: [createBattleStatusEmbed(this.battle)] });
    
    if (this.battle.turn === 'bakugo') {
      const batcher = new MessageBatcher(this.channel);
      batcher.add("Bakugo attacks first!");
      await this.executeBakugoTurn(batcher);
      await batcher.flush();
      
      // Check if either card died (player from damage OR Bakugo from recoil)
      if (this.battle.activePlayerCard.hp <= 0 || this.battle.activeBakugoCard.hp <= 0) {
        await this.checkBattleEnd();
        return;
      }
      
      this.battle.turn = 'player';
    }
    
    this.battle.state = 'CHOOSE_ACTION';
    await this.promptPlayerAction();
  }
  
  async handleAction(input) {
    const batcher = new MessageBatcher(this.channel);
    
    if (input === 'ultimate' && !canUseUltimate(this.battle.activePlayerCard)) {
      await this.channel.send("You can't use ultimate yet! (Need HP ≤ 50% and haven't used it) Type **attack** or **special**:");
      return;
    }
    
    if (!['attack', 'special', 'ultimate'].includes(input)) {
      await this.channel.send("Invalid action! Type **attack**, **special**, or **ultimate** (if available): THIS ISN'T THAT HARD DUMBASS!");
      return;
    }
    
    CombatSystem.attack(this.battle.activePlayerCard, this.battle.activeBakugoCard, batcher, input);
    await batcher.flush();
    
    // Check if either card died (defender from damage OR attacker from recoil)
    if (this.battle.activePlayerCard.hp <= 0 || this.battle.activeBakugoCard.hp <= 0) {
      await this.checkBattleEnd();
      return;
    }
    
    this.battle.turn = 'bakugo';
    batcher.add("Bakugo's turn!");
    await this.executeBakugoTurn(batcher);
    await batcher.flush();
    
    // Check if either card died (player from damage OR Bakugo from recoil)
    if (this.battle.activePlayerCard.hp <= 0 || this.battle.activeBakugoCard.hp <= 0) {
      await this.checkBattleEnd();
      return;
    }
    
    this.battle.turn = 'player';
    await this.channel.send({ embeds: [createBattleStatusEmbed(this.battle)] });
    await this.promptPlayerAction();
  }
  
  async executeBakugoTurn(batcher) {
    const useUltimate = canUseUltimate(this.battle.activeBakugoCard) && Math.random() < CONFIG.BAKUGO_ULTIMATE_CHANCE;
    const useSpecial = !useUltimate && Math.random() < CONFIG.BAKUGO_SPECIAL_CHANCE;
    const type = useUltimate ? 'ultimate' : useSpecial ? 'special' : 'normal';
    
    CombatSystem.attack(this.battle.activeBakugoCard, this.battle.activePlayerCard, batcher, type);
  }
  
  async promptPlayerAction() {
    const actions = ['**attack**', '**special**'];
    if (canUseUltimate(this.battle.activePlayerCard)) actions.push('**ultimate** ⚡');
    await this.channel.send(`Your turn! Type ${actions.join(' or ')}:`);
  }
  
  async checkBattleEnd() {
    const playerDefeated = this.battle.activePlayerCard.hp <= 0;
    const bakugoDefeated = this.battle.activeBakugoCard.hp <= 0;
    
    if (playerDefeated) {
      await this.channel.send(`💥 ${this.battle.activePlayerCard.name} is defeated!`);
      if (this.battle.activeBakugoCard.is_special && this.battle.activeBakugoCard.hp > 0) {
        await this.channel.send(`⚡ ${this.battle.activeBakugoCard.name} exhausted their power and collapses! Special characters can only defeat one opponent!`);
        this.battle.activeBakugoCard.hp = 0;
      }
    }
    
    if (bakugoDefeated) {
      await this.channel.send(`💥 ${this.battle.activeBakugoCard.name} is defeated!`);
      if (this.battle.activePlayerCard.is_special && this.battle.activePlayerCard.hp > 0) {
        await this.channel.send(`⚡ ${this.battle.activePlayerCard.name} exhausted their power and collapses! Special characters can only defeat one opponent!`);
        this.battle.activePlayerCard.hp = 0;
      }
    }
    
    const playerAlive = getAliveCards(this.battle.playerTeam);
    const bakugoAlive = getAliveCards(this.battle.bakugoTeam);
    
    if (playerAlive.length === 0 && bakugoAlive.length === 0) {
      await this.handleTie();
    } else if (playerAlive.length === 0) {
      await this.handleBakugoWin(bakugoAlive);
    } else if (bakugoAlive.length === 0) {
      await this.handlePlayerWin(playerAlive);
    } else {
      await this.handleNextRound(playerAlive, bakugoAlive);
    }
  }
  
  async handleTie() {
    const embed = new EmbedBuilder()
      .setColor('Yellow')
      .setTitle('💥 IT\'S A TIE! 💥')
      .setDescription("WHAT?! We both ran out of fighters at the same time?!")
      .addFields({ name: 'Final Result', value: "Neither of us could claim victory! This isn't over!" })
      .setFooter({ text: 'A draw... how unsatisfying!' });
    
    await this.channel.send({ embeds: [embed] });
    this.battle.finished = true;
  }
  
  async handleBakugoWin(survivors) {
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('🏆 BAKUGO WINS! 🏆')
      .setDescription("HAH! I'M THE BEST!! YOU'RE JUST A WEAK EXTRA!")
      .addFields({ name: 'Final Standing', value: `Bakugo's remaining fighters:\n${survivors.map(c => `${c.name} [${c.hp}/${c.maxHp} HP]`).join('\n')}` })
      .setFooter({ text: 'Better luck next time, loser!' });
    
    await this.channel.send({ embeds: [embed] });
    this.battle.finished = true;
  }
  
  async handlePlayerWin(survivors) {
    const embed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('🏆 YOU WIN! 🏆')
      .setDescription("Tch... You got lucky, that's all!")
      .addFields({ name: 'Your Survivors', value: `${survivors.map(c => `${c.name} [${c.hp}/${c.maxHp} HP]`).join('\n')}` })
      .setFooter({ text: "Don't get cocky! Next time I'll destroy you!" });
    
    await this.channel.send({ embeds: [embed] });
    this.battle.finished = true;
  }
  
  async handleNextRound(playerAlive, bakugoAlive) {
    // Handle player needing to select a new card
    if (this.battle.activePlayerCard.hp <= 0) {
      await this.channel.send("Choose your next fighter:");
      await this.channel.send(playerAlive.map((c, i) => `${i + 1}. ${c.name} [HP: ${c.hp}/${c.maxHp}]`).join('\n'));
      this.battle.state = 'SELECT_CARD';
      this.battle.activeBakugoCard = null; // Clear so handleCardSelection will assign new Bakugo card
      return;
    }
    
    // Handle Bakugo needing a new card (player's card is still alive)
    if (this.battle.activeBakugoCard.hp <= 0) {
      this.battle.activeBakugoCard = bakugoAlive[0];
      await this.channel.send(`Bakugo sends out ${this.battle.activeBakugoCard.name}! LETS GOOOO!`);
      
      // Check for instant battles with new Bakugo card
      const canonResult = checkCanonBattle(this.battle.activePlayerCard.name, this.battle.activeBakugoCard.name);
      if (canonResult) {
        await this.handleCanonBattle(canonResult);
        return;
      }
      
      const minetaCheck = checkMinetaFilter(this.battle.activePlayerCard, this.battle.activeBakugoCard);
      if (minetaCheck) {
        await this.handleInstantBattle(minetaCheck);
        return;
      }
      
      await this.channel.send({ embeds: [createBattleStatusEmbed(this.battle)] });
      await this.promptPlayerAction();
      this.battle.state = 'CHOOSE_ACTION';
      this.battle.turn = 'player';
    }
  }
}

// ==================== MAIN BATTLE RUNNER ====================
async function runBattle(channel, user, mode, cardCount, playerTeam = null, bakugoTeam = null) {
  const battle = {
    playerTeam: playerTeam || assignRandomCards(cardCount),
    bakugoTeam: bakugoTeam || assignRandomCards(cardCount),
    mode,
    turn: rollDice() % 2 === 0 ? 'player' : 'bakugo',
    state: 'SELECT_CARD',
    activePlayerCard: null,
    activeBakugoCard: null,
    finished: false,
    processing: false
  };
  
  await channel.send("🔥 **BAKUBATTLE BEGINS!** 🔥\nHAH! You think you can beat me?!");
  
  const embed = new EmbedBuilder()
    .setColor('Orange')
    .setTitle('Team Assignment')
    .setDescription(formatBattleStart(battle.playerTeam, battle.bakugoTeam, mode))
    .addFields({ name: 'Turn Order', value: `Rolled - ${battle.turn === 'player' ? 'You go' : 'Bakugo goes'} first!` });
    
  await channel.send({ embeds: [embed] });
  await channel.send("Choose your fighter (number or name):");
  
  const stateMachine = new BattleStateMachine(battle, channel);
  const filter = msg => msg.author.id === user.id && !msg.author.bot;
  const collector = channel.createMessageCollector({ filter, time: CONFIG.BATTLE_TIMEOUT });
  
  collector.on('collect', async msg => {
    if (!battle.finished) {
      await stateMachine.handleInput(msg.content.toLowerCase());
      if (battle.finished) collector.stop();
    }
  });
  
  collector.on('end', () => {
    if (!battle.finished) {
      channel.send("Battle timed out! Bakugo got bored and left. MAYBE NEXT TIME YOU'LL TYPE FASTER, EXTRA!");
    }
  });
}

// ==================== MODULE EXPORTS ====================
module.exports = {
  name: 'bakubattle',
  description: 'Battle Bakugo with MHA characters!',
  category: 'Fun',
  aliases: ['battle', 'bakufight'],
  usage: '!bakubattle [mode] [cards]\nMode 1: Show all stats\nMode 2: Hide power levels\nMode 3: Hide opponent info\nCards: 1-3',
  legacy: true,
  devOnly: false,
  
  async execute({ message, args }) {
    // DEV MODE: !bakubattle dev [mode]
    if (args[0] === 'dev') {
      if (!global.config.devIDs.includes(message.author.id)) {
        return message.reply("YOU'RE NOT A DEV! NICE TRY, EXTRA!");
      }

      const mode = args[1] ? parseInt(args[1]) : 1;
      if (isNaN(mode) || mode < 1 || mode > 3) {
        return message.reply("Mode must be 1, 2, or 3! Usage: `!bakubattle dev [mode]`");
      }

      const playerCards = createDevCards(DEV_PLAYER_CARDS);
      const bakugoCards = createDevCards(DEV_BAKUGO_CARDS);

      if (playerCards.length === 0 || bakugoCards.length === 0) {
        return message.reply("Dev cards not found! Check the card names in DEV_PLAYER_CARDS and DEV_BAKUGO_CARDS at the top of the file.");
      }

      await message.channel.send("🔧 **DEV MODE ACTIVATED** 🔧\nUsing hardcoded test teams!");
      await runBattle(message.channel, message.author, mode, 0, playerCards, bakugoCards);
      return;
    }

    // NORMAL MODE
    const mode = args[0] ? parseInt(args[0]) : 1;
    const cardCount = args[1] ? parseInt(args[1]) : 3;
    
    if (isNaN(mode) || mode < 1 || mode > 3) {
      return message.reply("Mode must be 1, 2, or 3! Try again, extra!");
    }
    
    if (isNaN(cardCount) || cardCount < 1 || cardCount > 3) {
      return message.reply("Cards must be between 1 and 3! Can't you count?!");
    }
    
    await runBattle(message.channel, message.author, mode, cardCount);
  }
};