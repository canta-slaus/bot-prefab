const discord = require("discord.js");
const config = require("../config/config.json");
const { registerCommands, registerEvents } = require('./utils/registry');

const client = new discord.Client();

(async () => {
    await client.login(config.TOKEN);
    client.commands = new discord.Collection();
    await registerEvents(client, '../eventHandlers');
    await registerCommands(client, '../commands');
})();