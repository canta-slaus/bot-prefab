//@ts-check

const PREFIX = require('../../config/config.json').PREFIX;

/**
 * Helper function to find a channel the bot can send a message in
 * @param {import('discord.js').Guild} guild 
 * @return {import('discord.js').TextChannel}
 */
const getDefaultChannel = (guild) => {
    let channel;
    // Get "original" default channel
    if (guild.channels.cache.has(guild.id)) {
        channel = guild.channels.cache.get(guild.id)
        if (channel.permissionsFor(guild.client.user).has("SEND_MESSAGES")) {
            //@ts-ignore
            return guild.channels.cache.get(guild.id)
        }
    }

    // Check for a "general" channel, which is often default chat
    channel = guild.channels.cache.find(channel => channel.name === "general" && channel.permissionsFor(guild.client.user).has("SEND_MESSAGES") && channel.type == "text");
    //@ts-ignore
    if (channel) return channel;

    // Now we get into the heavy stuff: first channel in order where the bot can speak
    //@ts-ignore
    return guild.channels.cache
        .filter(c => c.type === "text" &&
                     c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
        .sort((a, b) => a.position - b.position)
        .first();
}

/**
 * guildCreate event
 * @param {import('../typings.d').myClient} client 
 * @param {import('discord.js').Guild} guild 
 */
module.exports = async (client, guild) => {
    if (guild.available) {
        const channel = getDefaultChannel(guild);
        if (!channel) return;

        channel.send(`Thanks for adding me! My prefix is \`${PREFIX}\`\nFor a list of commands, type \`${PREFIX}help\``);
    }
}
