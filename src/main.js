const discord = require("discord.js");
const mongoose = require('mongoose')
const config = require("../config/config.json");
const { registerCommands, registerEvents } = require('./utils/registry');

const client = new discord.Client({ws: { intents: discord.Intents.ALL }});

(async () => {
    await client.login(config.TOKEN);
    console.log(`Logged in as ${client.user.tag}`)
    client.commands = new discord.Collection();
    client.guildInfoCache = new discord.Collection();
    client.DBGuild = require('../schemas/guildSchema');
    client.DBConfig = require('../schemas/config')
    await registerEvents(client, '../eventHandlers');
    await registerCommands(client, '../commands');
    await mongoose.connect(config.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });
    const blacklistFetch = await client.DBConfig.findByIdAndUpdate('blacklist', {}, {new: true, upsert: true, setDefaultsOnInsert: true})
    client.blacklistCache = new Set(blacklistFetch.blacklisted)
    console.log('Added all commands, events, schemas and connected to MongoDB.')
})();
