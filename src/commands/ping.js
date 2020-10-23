const PREFIX = require('../../../config/config.json').PREFIX;

module.exports = {
    name: "ping",
    aliases: ["pong"],
    description: "Get the bots current ping.",
    usage: `\`${PREFIX}ping\``,
    
    execute: async function(client, message, args) {
        try {
            const msg = await message.channel.send("Ping?");
            await msg.edit(`Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms.`);
        } catch (err) {
            message.channel.send(`${message.author.username}, oops, something went wrong! Contact support.\nError: \`${err.message}\``)
        }
    }
}
