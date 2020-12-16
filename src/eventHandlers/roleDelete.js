const { Client, Role } = require('discord.js')

/**
 * guildUpdate event
 * @param {Client} client 
 * @param {Role} role 
 */
module.exports = async (client, role) => {
    let guildInfo = client.guildInfoCache.get(role.guild.id)
    if (!guildInfo) {
        const fetch = await client.DBGuild.findByIdAndUpdate(role.guild.id, {}, { new: true, upsert: true, setDefaultsOnInsert: true });
        guildInfo = {};
        guildInfo['prefix'] = fetch.prefix;
        if (fetch.disabledCommands) guildInfo.disabledCommands = fetch.disabledCommands;
        if (fetch.commandPerms) guildInfo.commandPerms = fetch.commandPerms
        if (fetch.commandCooldowns) guildInfo.commandCooldowns = fetch.commandCooldowns
        client.guildInfoCache.set(role.guild.id, guildInfo)
    }

    let commandCooldowns = guildInfo.commandCooldowns || {}

    for (const command of Object.keys(commandCooldowns)) {
        if (!commandCooldowns[command][role.id]) continue

        delete commandCooldowns[command][role.id]

        if (Object.keys(commandCooldowns[command]).length === 0) delete commandCooldowns[command]
    }

    await client.DBGuild.findByIdAndUpdate(role.guild.id, { $set: { commandCooldowns: commandCooldowns } }, { new: true, upsert: true, setDefaultsOnInsert: true })

    guildInfo.commandCooldowns = commandCooldowns
    client.guildInfoCache.set(role.guild.id, guildInfo)
}
