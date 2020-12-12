const PREFIX = require('../../config/config.json').PREFIX;

const prefixRegExp = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{1,15}$/;

module.exports = {
    name: "setprefix",
    aliases: ["sp"],
    description: "Set a new prefix for your server.",
    usage: `\`${PREFIX}setprefix [newprefix]\``,
    serverOwnerOnly: true,
    arguments: [
        {
            type: 'STRING',
            prompt: 'Please enter a new prefix to use!'
        }
    ],
    
    execute: async function(client, message, args) {
        if (!prefixRegExp.test(args[0])) return message.channel.send(`${message.author.username}, that prefix doesn't follow the rules. Please try again.`)
        const guildInfo = client.guildInfoCache.get(message.guild.id)
        if (guildInfo.prefix === args[0]) return message.channel.send(`${message.author.username}, please make sure to enter a new prefix.`)
        await client.DBGuild.findByIdAndUpdate(message.guild.id, {$set: { prefix: args[0]} }, { new: true, upsert: true, setDefaultsOnInsert: true });
        guildInfo.prefix = args[0]
        client.guildInfoCache.set(message.guild.id, guildInfo)
        message.channel.send(`${message.author.username}, the new prefix is: \`${args[0]}\``)
    }
}
