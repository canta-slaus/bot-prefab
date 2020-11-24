const { processArguments, msToTime } = require("../utils/utils")
const { Collection } = require("discord.js")
const cooldowns = new Collection();
const { devs, someServers } = require('../../config/config.json')

module.exports = async (client, message) => {
    if (message.author.bot || message.channel.type === 'dm' || client.blacklistCache.has(message.author.id)) return;

    let guildInfo = client.guildInfoCache.get(message.guild.id)
    if (!guildInfo) {
        const fetch = await client.DBGuild.findByIdAndUpdate(message.guild.id, {}, { new: true, upsert: true, setDefaultsOnInsert: true });
        guildInfo = {};
        guildInfo['prefix'] = fetch.prefix;
        if (fetch.disabledCommands) guildInfo['disabledCommands'] = fetch.disabledCommands;
        if (fetch.commandPerms) guildInfo['commandPerms'] = fetch.commandPerms
        client.guildInfoCache.set(message.guild.id, guildInfo)
    }
    const PREFIX = guildInfo.prefix
    if (!message.content.startsWith(PREFIX)) return;

    let msgargs = message.content.substring(PREFIX.length).split(new RegExp(/\s+/));
    let cmdName = msgargs.shift().toLowerCase();
    
    const command = await client.commands.get(cmdName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));

    if (!command) return;

    if (command.devOnly && !devs.includes(message.author.id)) return;
    if (command.someServersOnly && !someServers.includes(message.guild.id)) return;
    if (command.serverOwnerOnly && message.guild.ownerID !== message.author.id) return;

    if (guildInfo.disabledCommands.includes(command.name)) return;
    if ((guildInfo.commandPerms && guildInfo.commandPerms[command.name] && !message.member.hasPermission(guildInfo.commandPerms[command.name]))
        || (command.perms && !message.member.hasPermission(command.perms))) return;
    
    const cd = command.cooldown;
    if (cd) {
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = cd * 1000;
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) return await message.channel.send(`${message.author.username}, please wait \`${msToTime(expirationTime - now)}\` before using this command again.`)
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }

    if (command.arguments && command.arguments.length !== 0) msgargs = processArguments(message, command.arguments, msgargs)
    if (!msgargs) return;
    try {
        command.execute(client, message, msgargs);
    } catch (error) {
        message.channel.send(`Oops, something went wrong!`)
        console.log(`Error occured!\nAt command: ${command.name}\nError message: ${error.message}\nError trace: ${error.trace}`)
    }
};
