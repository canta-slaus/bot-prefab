const PREFIX = require('../../config/config.json').PREFIX;

module.exports = {
    name: "ping",
    aliases: ["pong"],
    description: "Get the bots current ping.",
    usage: `\`${PREFIX}ping\``,
    
    execute: async function(client, message, args) {
        try {
            message.channel.send(`Ping! ${Date.now() - message.createdTimestamp}ms\nWS: ${client.ws.ping}ms`);
        } catch (err) {
            message.channel.send(`${message.author.username}, oops, something went wrong! Contact support.\nError: \`${err.message}\``)
        }
    }
}
