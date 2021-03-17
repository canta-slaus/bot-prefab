//@ts-check

const { getGuildInfo } = require('../utils/utils');

/**
 * roleDelete event
 * @param {import('../typings.d').myClient} client 
 * @param {import('discord.js').Role} role 
 */
module.exports = async (client, role) => {
    let guildInfo = await getGuildInfo(client, role.guild.id);

    let commandCooldowns = guildInfo.commandCooldowns || {};

    let update = false;
    for (const command of Object.keys(commandCooldowns)) {
        if (!commandCooldowns[command][role.id]) continue;

        update = true;
        delete commandCooldowns[command][role.id];

        if (Object.keys(commandCooldowns[command]).length === 0) delete commandCooldowns[command];
    }

    if (!update) return;

    guildInfo = await client.DBGuild.findByIdAndUpdate(role.guild.id, { $set: { commandCooldowns: commandCooldowns } }, { new: true, upsert: true, setDefaultsOnInsert: true });

    client.guildInfoCache.set(role.guild.id, guildInfo);
}
