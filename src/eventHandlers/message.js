const { processArguments } = require("../utils/utils")
const { Collection } = require("discord.js")
const cooldowns = new Collection();

module.exports = async (client, message) => {
    
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;

    let guildInfo = client.guildInfoCache.get(message.guild.id)
    if (!guildInfo) {
        const fetch = await client.DBGuild.findByIdAndUpdate(message.guild.id, {}, {new: true, upsert: true, setDefaultsOnInsert: true});
        guildInfo = {};
        guildInfo['prefix'] = fetch.prefix;
        guildInfo['disabledCommands'] = fetch.disabledCommands;
        client.guildInfoCache.set(message.guild.id, guildInfo)
        console.log(guildInfo)
    }
    const PREFIX = guildInfo.prefix

    if (!message.content.startsWith(PREFIX)) return;

    let msgargs = message.content.substring(PREFIX.length).split(new RegExp(/\s+/));
    let cmdName = msgargs.shift().toLowerCase();
    
    const command = await client.commands.get(cmdName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));

    if (!command) return;

    if (guildInfo.disabledCommands.includes(command.name)) return;

    if (command.perms && !message.member.hasPermission(command.perms)) return;
    
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
            if (now < expirationTime) return await message.channel.send(`${message.author.username}, please wait ${new Date(expirationTime - now).toISOString().substr(11, 8)} before using this command again.`)
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
