/**
 * @type {import('../typings.d').Command}
 */
module.exports = {
    name: "ping",
    category: "Misc",
    aliases: ["pong"],
    clientPerms: ['SEND_MESSAGES'],
    
    execute: async function(client, message, args) {
        const msg = await message.channel.send("Ping?");
        await msg.edit(`Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms.`);
    }
}
