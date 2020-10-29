const discord = require("discord.js");
const config = require("../config/config.json");
const { registerCommands, registerEvents } = require('./utils/registry');

const client = new discord.Client({ws: { intents: discord.Intents.ALL }});

(async () => {
    await client.login(config.TOKEN);
    console.log(`Logged in as ${client.user.tag}`)
    client.commands = new discord.Collection();
    await registerEvents(client, '../eventHandlers');
    await registerCommands(client, '../commands');
})();