const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
const characters = require(path.resolve(__dirname, '../../jsons/mha_characters.json'));



const characterMapping = {
    "Izuku Midoriya": ["izukumidoriya", "izuku", 'deku', 'izukumidoriya',' midoriya'],
    "Katsuki Bakugo": ['bakugo', 'katsuki', 'katsukibakugo', 'dynamight', 'kacchan'],
    "Yuga Aoyama": ['yuga', 'aoyama', 'yugaaoyama', 'can\'t stop twinkling', 'twinkling'],
    "Mina Ashido": ['mina', 'ashido', 'minaashido', 'pinky'],
    "Tsuyu Asui": ['tsuyu', 'asui', 'tsuyuasui', 'froppy'],
    "Tenya Iida": ['tenya', 'iida', 'tenyaiida', 'ingenium', 'ida', 'tenyaida'],
    "Ochaco Uraraka": ['ochaco', 'uraraka', 'ochacouraraka', 'uravity', 'gravity'],
    "Mashirao Ojiro": ['mashirao', 'ojiro', 'mashiraojiro', 'tailman'],
    "Denki Kaminari": ['denki', 'kaminari', 'denkikaminari', 'chargebolt'],
    "Eijiro Kirishima": ['eijiro', 'kirishima', 'eijirokirishima', 'redriot'],
    "Koji Koda": ['koji', 'koda', 'kojikoda', 'anima'],
    "Rikido Sato": ['rikido', 'sato', 'rikidosato', 'sugarman'],
    "Mezo Shoji": ['mezo', 'shoji', 'mezoshoji', 'tentacole'],
    "Kyoka Jiro": ['kyoka', 'jiro', 'kyokajiro', 'earphonejack'],
    "Hanta Sero": ['hanta', 'sero', 'hantasero', 'canteen'],
    "Fumikage Tokoyami": ['fumikage', 'tokoyami', 'fumikagetokoyami', 'tsukuyomi', 'darkshadow'],
    "Shoto Todoroki": ['shoto', 'todoroki', 'shototodoroki', 'shouta', 'shouto', 'shoutotodoroki'],
    "Toru Hagakure": ['toru', 'hagakure', 'toruhagakure', 'invisiblegirl'],
    "Minoru Mineta": ['minoru', 'mineta', 'minorumineta', 'grapejuice'],
    "Momo Yaoyorozu": ['momo', 'yaoyorozu', 'momoyaoyorozu', 'creativity', 'creati'],
    "Mirio Togata": ['mirio', 'togata', 'miriotogata', 'lemillion'],
    "Tamaki Amajiki": ['tamaki', 'amajiki', 'tamakiamajiki', 'suneater'],
    "Nejire Hado": ['nejire', 'hado', 'nejirehado', 'nejirechan'],
    'Tomura Shigaraki': ['tomura', 'shigaraki', 'tomurashigaraki', 'tenko', 'tenkoshimura'],
    'Toshinori Yagi': ['toshinori', 'yagi', 'toshinoriyagi', 'allmight', 'allmight'],
    "Shota Aizawa": ['shota', 'aizawa', 'shotaaizawa', 'eraserhead', 'shouta', 'shoutaaizawa'],
    "Unknown Shigaraki": ['allforone'],
    "Kurogiri": ['kurogiri', 'oboroshirakumo', 'oboro', 'shirakumo'],
    "Gigantomachia": ['gigantomachia', 'machia'],
    "Kyudai Garaki": ['kyudai', 'garaki', 'daruma', 'darumaujiko','ujiko','doctor', 'kyudaigaraki'],
    "Dabi": ['dabi', 'touya', 'touyatodoroki', 'toya', 'toyatodoroki'],
    "Jin Bubaigawara": ['twice', 'jin', 'jinbubaigawara', 'jinbubaigawara'],
    "Shuichi Iguchi": ['spinner', 'shuichi', 'shuichihiguchi', 'iguchi'],
    "Atsuhiro Sako": ['compress', 'mrcompress', 'mr.compress', 'atsuhirosako', 'atsuhiro', 'sako'],
    "Himiko Toga": ['himiko', 'toga', 'himikotoga'],
    "Eri": ['eri', 'erichan', 'eriaizawa'],
    "Enji Todoroki": ['enji', 'enjitodoroki', 'endeavor'],
    "Rumi Usagiyama": ['rumi', 'usagiyama', 'rumiusagiyama', 'mirko'],
    "Keigo Takami": ['keigo', 'takami', 'keigotakami', 'hawks'],
    "Nana Shimura": ['nana', 'shimura', 'nanashimura'],
    "Kaina Tsutsumi": ['kaina', 'tsutsumi', 'kainatsutsumi', 'ladynagant', 'nagant'],
    "Mirai Sasaki": ['mirai', 'sasaki', 'miraisasaki', 'sirnighteye', 'nighteye'],
    "Yosetsu Awase": ['yosestu', 'awase', 'yosetsuawase', 'welder'],
    "Sen Kaibara": ['sen', 'kaibara', 'senkaibara', 'spiral'],
    "Togaru Kamakiri": ['togaru', 'kamakiri', 'togarukamakiri', 'jackmantis'],
    "Shihai Kuroiro": ['shihai', 'kuroiro', 'shihaikuroiro', 'vanta', 'vantablack'],
    "Itsuka Kendo": ['itsuka', 'kendo', 'itsukakendo', 'battlefist'],
    "Yui Kodai": ['yui', 'kodai', 'yuikodai', 'rule',],
    "Kinoko Komori": ['kinoko', 'komori', 'kinokokomori', 'shemage'],
    "Ibara Shiozaki": ['ibara', 'shiozaki', 'ibarashiozaki', 'vine'],
    "Jurota Shishida": ['jurota', 'shishida', 'jurotashishida', 'Gevaudan'],
    "Nirengeki Shoda": ['nirengeki', 'shoda', 'nirengekishoda', 'mines'],
    "Pony Tsunotori": ['pony', 'tsunotori', 'ponytsunotori', 'rocketti'],
    "Kosei Tsuburaba": ['kosei', 'tsuburaba', 'koseitsuburaba', 'aeroblade'],
    "Tesutetsu Tetsutetsu": ['tesutetsu', 'tetsutetsutetsutetsu', 'realsteel'],
    "Kojiro Bondo": ['kojiro', 'bondo', 'kojirobondo', 'plamo'],
    "Neito Monoma": ['neito', 'monoma', 'neitomonoma', 'copycat', 'phantomthief'],
    "Reiko Yanagi": ['reiko', 'yanagi', 'reikoyanagi', 'empress' , 'emily'],
    "Hiryu Rin": ['hiryu', 'rin', 'hiryurin', 'dragonshroud'],
    "Setsuna Tokage": ['setsuna', 'tokage', 'setsunatokage', 'lizardy'],
    "Manga Fukidashi": ['manga', 'fukidashi', 'mangafukidashi', 'comicman'],
    "Juzo Honenuki": ['juzo', 'honenuki', 'juzohonenuki', 'mudman'],
    "Nemuri Kayama": ['nemuri', 'kayama', 'nemurikayama', 'midnight'],
    "Oceanmonk2000": ['oceanmonk2000', 'ocean', 'creator','dmxocean', 'dmx'],
    "Kai Chisaki": ['overhaul', 'kai', 'chisaki', 'kaichisaki'],
    "Hari Kurono": ['chronostasis', 'hari', 'harikurono', 'kurono'],
    "Joi Irinaka": ['mimic', 'joi', 'joi irinaka', 'irinaka'],
    "Rikiya Katsukame": ['rikiya', 'katsukame', 'rikiyakatsukame',],
    "Toya Setsuno": ['toya', 'setsuno', 'toyasetsuno', 'larceny'],
    "Kendo Rappa": ['kendo', 'rappa', 'kendorappa'],
    //"Deidoro Sakaki": ['mimic', 'deidoro', 'deidoro sakaki', 'sakaki'],
    //"Stain": ['stain', 'hero killer', 'killer', 'stain'],
    //"Hizashi Yamada": ['hizashi', 'yamada', 'hizashiyamada', 'presentmic', 'present', 'mic'],

};

const aliasToCharacter = {};
for (const [name, aliases] of Object.entries(characterMapping)) {
  for (const alias of aliases) {
    aliasToCharacter[alias.toLowerCase()] = name;
  }
}

function buildCharacterEmbed(characterName) {
  const characterObj = characters.find(info => info.callname === characterName);
  if (!characterObj) {
    console.warn(`[WARN] Character not found in JSON: ${characterName}`);
    return {
      content: `I couldn't find data for **${characterName}**. Ask Ocean to double-check the file.`,
      ephemeral: true
    };
  }

  const c = characterObj; // consistent naming
  console.log('[DEBUG] Character data:', c);

  const embed = new EmbedBuilder()
    .setColor(c.color || '#FF0000')
    .setTitle(c.callname)
    .addFields(
      {
        name: 'Other known names',
        value:
          Array.isArray(c.OKN) &&
          c.OKN.filter(name =>
            typeof name === 'string' && !['n/a', 'none', 'unknown'].includes(name.toLowerCase())
          ).length > 0
            ? c.OKN
                .filter(name =>
                  typeof name === 'string' && !['n/a', 'none', 'unknown'].includes(name.toLowerCase())
                )
                .join(', ')
            : 'None'
      },      
      { name: 'Slogan', value: c.slogan || 'None' },
      { name: 'Hero/Villain name', value: c.hvName || 'Unknown' },
      { name: 'Quirk', value: c.quirk || 'Unknown' },
      { name: 'Quirk details', value: c.qd || 'None' },
      { name: 'Status', value: c.status || 'Unknown' },
      { name: 'Birthday', value: c.birthday || 'Unknown' },
      { name: 'Fun fact', value: c.ff || 'None' },
      { name: 'More information at:', value: c.info || 'No link available' },
      { name: '⚠️ Owner Warning', value: 'Spoilers may exist. You’ve been warned, nerd.' }
    );

  if (c.Image?.startsWith('http')) {
    embed.setImage(c.Image);
    return { embeds: [embed] };
  } else {
    const imagePath = path.join(__dirname, '../../../jsons', c.Image || '');
    if (fs.existsSync(imagePath)) {
      embed.setImage('attachment://image.png');
      return {
        embeds: [embed],
        files: [{ attachment: imagePath, name: 'image.png' }]
      };
    } else {
      embed.addFields({ name: 'Image', value: 'Image not found.' });
      return { embeds: [embed] };
    }
  }
}


module.exports = {
  name: 'analysis',
  description: 'Get detailed info about an MHA character',
  category: 'Fun',
  aliases: ['analyze', 'info'],
  legacy: true,
  slash: true,
  devOnly: false,
  ownerOnly: false,
  data: new SlashCommandBuilder()
    .setName('analysis')
    .setDescription('Lookup a My Hero Academia character')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The character name or nickname')
        .setRequired(true)
    ),

  async execute({message, args}) {
    const rawName = args.join(' ').toLowerCase().trim();
    const cleanName = rawName.split("undefined")[0].trim();

    
    const character = aliasToCharacter[cleanName];
    

    if (!character) {
      console.log("[DEBUG] Character not found in aliasToCharacter mapping.");
      return message.reply(`I don’t know that name, extra. Either it’s not added or you spelled it wrong.`);
    }
    const result = buildCharacterEmbed(character);

    return message.reply(result);
  },

  async slashExecute(interaction) {
    const input = interaction.options.getString('name')?.toLowerCase();
    const character = aliasToCharacter[input];

    if (!character) {
      return interaction.reply({
        content: 'That character isn’t in my database. Talk to the bot owner or spell it right.',
        ephemeral: true
      });
    }

    const result = buildCharacterEmbed(character);
    return interaction.reply(result);
  }
};
