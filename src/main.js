const discord = require("discord.js");
const mongoose = require('mongoose')
const config = require("../config/config.json");
const { registerCommands, registerEvents } = require('./utils/registry');

const client = new discord.Client({ws: { intents: discord.Intents.ALL }, presence: {status: 'invisible'}});

(async () => {
    await client.login(config.TOKEN);
    console.log(`Logged in as ${client.user.tag}`)
    client.commands = new discord.Collection();
    client.guildInfoCache = new discord.Collection();
    client.DBGuild = require('../schemas/guildSchema');
    await registerEvents(client, '../eventHandlers');
    await registerCommands(client, '../commands');
    await mongoose.connect(config.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });
})();