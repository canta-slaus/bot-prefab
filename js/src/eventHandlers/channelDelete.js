//@ts-check

const { getGuildInfo } = require('../utils/utils');

/**
 * channelDelete event
 * @param {import('../typings.d').myClient} client 
 * @param {import('discord.js').GuildChannel} channel 
 */
module.exports = async (client, channel) => {
    if (!channel.guild) return;
    if (channel.type !== 'text') return;

    let guildInfo = await getGuildInfo(client, channel.guild.id);

    let disabledChannels = guildInfo.disabledChannels;

    if (!disabledChannels.includes(channel.id)) return;

    guildInfo = await client.DBGuild.findByIdAndUpdate(channel.guild.id, { $pull: { disabledChannels: channel.id } }, { new: true, upsert: true, setDefaultsOnInsert: true });
    client.guildInfoCache.set(channel.guild.id, guildInfo);
}
