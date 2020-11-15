const PREFIX = require('../../config/config.json').PREFIX;

module.exports = {
    name: "setprefix",
    aliases: ["sp"],
    description: "Set a new prefix for your server.",
    usage: `\`${PREFIX}setprefix [newprefix]\``,
    arguments: [
        {
            type: 'STRING',
            prompt: 'Please enter a new prefix to use!'
        }
    ],
    
    execute: async function(client, message, args) {
        await client.DBGuild.findByIdAndUpdate(message.guild.id, {$set: {prefix: args[0]}}, {new: true, upsert: true, setDefaultsOnInsert: true});
        const guildInfo = client.guildInfoCache.get(message.guild.id)
        guildInfo.prefix = args[0]
        client.guildInfoCache.set(message.guild.id, guildInfo)
        message.channel.send(`The new prefix is: \`${args[0]}\``)
    }
}
