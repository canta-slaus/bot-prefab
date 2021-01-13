const discord = require("discord.js");
const mongoose = require('mongoose')
const config = require("../config/config.json");
const { registerCommands, registerEvents } = require('./utils/registry');
const { log } = require('./utils/utils')

const client = new discord.Client({ ws: { intents: discord.Intents.ALL } });

(async () => {
    client.commands = new discord.Collection();
    client.categories = new discord.Collection();
    client.guildInfoCache = new discord.Collection();
    client.userInfoCache = new discord.Collection();

    client.DBGuild = require('../schemas/guildSchema');
    client.DBConfig = require('../schemas/config');
    client.DBUser = require('../schemas/userSchema');

    client.serverCooldowns = new discord.Collection();
    client.globalCooldowns = new discord.Collection();

    await registerEvents(client, '../eventHandlers');
    await registerCommands(client, '../commands');

    try {
        await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });

        const blacklistFetch = await client.DBConfig.findByIdAndUpdate('blacklist', { }, { new: true, upsert: true, setDefaultsOnInsert: true }).then(doc => { return JSON.parse(JSON.stringify(doc)) });
        client.blacklistCache = new Set(blacklistFetch.blacklisted);
        log("SUCCESS", "src/main.js", "Connected to the database.")
    } catch (e) {
        log("ERROR", "src/main.js", `Error connecting to the database: ${e.message}`)
        log("ERROR", "src/main.js", "As of now, the prefab heavily relies on a successful connection.\nThere is a short guide on how to setup a MongoDB cluster (online cluster, not localhost) over at https://github.com/canta-slaus/bot-prefab/wiki/Setting-up-a-cluster")
        process.exit(1)
    };

    try {
        await client.login(config.TOKEN);
        log("SUCCESS", "src/main.js", `Logged in as ${client.user.tag}`);
    } catch (e) {
        log("ERROR", "src/main.js", `Error logging in: ${e.message}`);
    };

    log("SUCCESS", "src/main.js", "Added all commands, categories, events, schemas and connected to MongoDB.");
})();
