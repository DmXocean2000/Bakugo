require('dotenv').config({ path: '../.env' });

const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const path = require('path');

global.config = require(path.resolve(__dirname, '../config.js'));

const loadCommands = require('./handlers/loadCommands');
const loadEvents = require('./handlers/loadEvent');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});
loadCommands(client);
loadEvents(client);


mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    client.login(process.env.TOKEN);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
  });
