const EMBED_COLOR = require('../../config/config.json').EMBED_COLOR;
const { MessageEmbed } = require('discord.js')

/**
 * @type {import('../typings.d').Command}
 */
module.exports = {
    name: "commands",
    category: "Utility",
    aliases: ["c"],
    canNotDisable: true,
    serverOwnerOnly: true,
    clientPerms: ['SEND_MESSAGES', 'EMBED_LINKS'],
    
    execute: async function(client, message, args) {
        let guildInfo = client.guildInfoCache.get(message.guild.id);
        let disabledCommands = guildInfo.disabledCommands;

        if (!args[0]) {
            const embed = new MessageEmbed()
            .setColor(EMBED_COLOR)
            .setTimestamp()
            .setTitle('Disabled Commands')
            .setDescription(disabledCommands.length === 0 ? 'There are no disabled commands in this server!' : '\`' + disabledCommands.join('\`, \`') + '\`')

            message.channel.send(embed)
        } else {
            if (!args[1]) return message.channel.send('Please specify a command.');

            const command = client.commands.get(args[1].toLowerCase())
            if (!command) return message.channel.send(`The command \`${args[1]}\` does not exist.`)

            if (command.canNotDisable) return message.channel.send(`The command \`${command.name}\` can not be disabled/enabled.`)

            switch (args[0]) {
                case 'disable':
                    if (disabledCommands.includes(command.name)) return message.channel.send(`The command \`${command.name}\` is already disabled.`)
    
                    await client.DBGuild.findByIdAndUpdate(message.guild.id, {$push: { disabledCommands: command.name }}, { new: true, upsert: true, setDefaultsOnInsert: true })
                    guildInfo.disabledCommands.push(command.name)
                    client.guildInfoCache.set(message.guild.id, guildInfo)

                    message.channel.send(`The command \`${command.name}\` has been disabled.`)
                    break;
                case 'enable':
                    if (!disabledCommands.includes(command.name)) return message.channel.send(`The command \`${command.name}\` is already enabled.`)

                    await client.DBGuild.findByIdAndUpdate(message.guild.id, {$pull: { disabledCommands: command.name }}, { new: true, upsert: true, setDefaultsOnInsert: true })
                    let index = guildInfo.disabledCommands.indexOf(command.name)
                    guildInfo.disabledCommands.splice(index, 1)
                    client.guildInfoCache.set(message.guild.id, guildInfo)

                    message.channel.send(`The command \`${command.name}\` has been enabled.`)
                    break;
            }
        }
    }
}