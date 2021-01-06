const { CustomEmbed } = require('../utils/utils')

/**
 * @type {import('../typings.d').Command}
 */
module.exports = {
    name: "channels",
    category: "Utility",
    aliases: ["chan"],
    canNotDisable: true,
    ignoreDisabledChannels: true,
    serverOwnerOnly: true,
    clientPerms: ['SEND_MESSAGES', 'EMBED_LINKS'],
    
    execute: async function(client, message, args) {
        let guildInfo = client.guildInfoCache.get(message.guild.id);
        let disabledChannels = guildInfo.disabledChannels;

        const channelEmbed = new CustomEmbed({ client: client, userID: message.author.id })
        .setTimestamp()

        if (!args[0]) {
            channelEmbed
            .setTitle('Disabled Channels')
            .setDescription(disabledChannels.length === 0 ? 'There are no disabled channels in this server!' : '<#' + disabledChannels.join('>, <#') + '>')

            return message.channel.send(channelEmbed)
        }

        if (!args[1]) return message.channel.send(channelEmbed.setDescription('**Please specify a channel to disable.**'));

        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1])
        if (!channel) return message.channel.send(channelEmbed.setDescription(`**The channel ${args[1]} does not exist.**`))
        if (channel.type !== 'text') return message.channel.send(channelEmbed.setDescription(`**You can only disable text channels.**`))

        switch (args[0]) {
            case 'disable':
                if (disabledChannels.includes(channel.id)) return message.channel.send(channelEmbed.setDescription(`**The channel ${channel} is already disabled.**`))

                await client.DBGuild.findByIdAndUpdate(message.guild.id, { $push: { disabledChannels: channel.id } }, { new: true, upsert: true, setDefaultsOnInsert: true })
                guildInfo.disabledChannels.push(channel.id)
                client.guildInfoCache.set(message.guild.id, guildInfo)

                message.channel.send(channelEmbed.setDescription(`**The channel ${channel} has been disabled.**`))
                break;
            case 'enable':
                if (!disabledChannels.includes(channel.id)) return message.channel.send(channelEmbed.setColor(EMBED_COLOR).setDescription(`**The channel ${channel} is already enabled.**`))

                guildInfo = await client.DBGuild.findByIdAndUpdate(message.guild.id, { $pull: { disabledChannels: channel.id } }, { new: true, upsert: true, setDefaultsOnInsert: true })
                client.guildInfoCache.set(message.guild.id, guildInfo)

                message.channel.send(channelEmbed.setDescription(`**The channel ${channel} has been enabled.**`))
                break;
            default:
                message.channel.send(channelEmbed.setDescription(`${message.author}, please check the usage of the command.`))
                break;
        }
    }
}

