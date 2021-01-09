import Discord from "discord.js";
import { Client } from "../types";

export default async (client: Client, channel: Discord.GuildChannel) => {
    if (!channel.guild) return;
    if (channel.type !== 'text') return;

    let guildInfo = client.guildInfoCache.get(channel.guild.id);
    if (!guildInfo) {
        guildInfo = await client.DBGuild.findByIdAndUpdate(channel.guild.id, {  }, { new: true, upsert: true, setDefaultsOnInsert: true });
        //@ts-ignore
        delete guildInfo._id;
        client.guildInfoCache.set(channel.guild.id, guildInfo);
    }

    let disabledChannels = guildInfo.disabledChannels;

    if (!disabledChannels.includes(channel.id)) return;

    guildInfo = await client.DBGuild.findByIdAndUpdate(channel.guild.id, { $pull: { disabledChannels: channel.guild.id } }, { new: true, upsert: true, setDefaultsOnInsert: true });
    //@ts-ignore
    delete guildInfo._id;
    client.guildInfoCache.set(channel.guild.id, guildInfo);
}