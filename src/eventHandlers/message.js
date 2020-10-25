const PREFIX = require("../../config/config.json").PREFIX;
const { processArguments } = require("../utils/utils")
const { Collection } = require("discord.js")
const cooldowns = new Collection();

module.exports = async (client, message) => {
    
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;
    if (!message.content.startsWith(PREFIX)) return;

    let msgargs = message.content.substring(PREFIX.length).split(new RegExp(/\s+/));
    let cmdName = msgargs.shift().toLowerCase();
    
    const command = await client.commands.get(cmdName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));

    if (!command) return;
    if (command.perms) {
        if (!message.member.hasPermission(command.perms)) return
    }
    
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

    if (command.arguments && command.arguments.length !== 0) processArguments(message, command.arguments)

    command.execute(client, message, msgargs);
};
