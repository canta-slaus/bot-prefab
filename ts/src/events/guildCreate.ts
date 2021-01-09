import Discord from "discord.js";
import { PREFIX } from "../../config/config.json";
import { Client } from "../types";

const getDefaultChannel = (guild: Discord.Guild) => {
    let channel;
    if (guild.channels.cache.has(guild.id)) {
        channel = guild.channels.cache.get(guild.id)!;
        if (channel.permissionsFor(guild.client.user!)!.has("SEND_MESSAGES")) {
        return guild.channels.cache.get(guild.id);
        }
    }

    channel = guild.channels.cache.find((channel) => channel.name === "general" && channel.permissionsFor(guild.client.user!)!.has("SEND_MESSAGES"));
    if (channel) return channel;

    return guild.channels.cache
        .filter(
            (c) =>
                c.type === "text" &&
                c.permissionsFor(guild.client.user!)!.has("SEND_MESSAGES")
        ).sort((a, b) => a.position - b.position).first();
};

export default async (client: Client, guild: Discord.Guild) => {
    if (guild.available) {
        const channel = getDefaultChannel(guild) as Discord.TextChannel;
        if (!channel) return;
        channel.send(`Thanks for adding me! My prefix is \`${PREFIX}\`\nFor a list of commands, type \`${PREFIX}help\``);
    }
};
