const { Channel } = require('discord.js');

/**
 * channelDelete event
 * @param {import('../typings.d').myClient} client 
 * @param {Channel} channel 
 */
module.exports = async (client, channel) => {
    let guildInfo = client.guildInfoCache.get(channel.guild.id)
    if (!guildInfo) {
        const fetch = await client.DBGuild.findByIdAndUpdate(channel.guild.id, {}, { new: true, upsert: true, setDefaultsOnInsert: true });
        guildInfo = fetch
        delete guildInfo._id
        client.guildInfoCache.set(channel.guild.id, guildInfo)
    }

    if (channel.type !== 'text') return;

    let disabledChannels = guildInfo.disabledChannels

    if (!disabledChannels.includes(channel.id)) return;

    guildInfo = await client.DBGuild.findByIdAndUpdate(channel.guild.id, { $pull: { disabledChannels: channel.id } }, { new: true, upsert: true, setDefaultsOnInsert: true })
    client.guildInfoCache.set(channel.guild.id, guildInfo)
}
