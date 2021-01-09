const { GuildChannel } = require('discord.js');

/**
 * channelDelete event
 * @param {import('../typings.d').myClient} client 
 * @param {GuildChannel} channel 
 */
module.exports = async (client, channel) => {
    if (!channel.guild) return;
    if (channel.type !== 'text') return;

    let guildInfo = client.guildInfoCache.get(channel.guild.id)
    if (!guildInfo) {
        guildInfo = await client.DBGuild.findByIdAndUpdate(channel.guild.id, {}, { new: true, upsert: true, setDefaultsOnInsert: true });
        delete guildInfo._id
        client.guildInfoCache.set(channel.guild.id, guildInfo)
    }

    let disabledChannels = guildInfo.disabledChannels

    if (!disabledChannels.includes(channel.id)) return;

    guildInfo = await client.DBGuild.findByIdAndUpdate(channel.guild.id, { $pull: { disabledChannels: channel.id } }, { new: true, upsert: true, setDefaultsOnInsert: true })
    delete guildInfo._id
    client.guildInfoCache.set(channel.guild.id, guildInfo)
}
