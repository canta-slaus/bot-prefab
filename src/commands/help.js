const EMBED_COLOR = require('../../config/config.json').EMBED_COLOR;
const { MessageEmbed } = require("discord.js");

const replacePrefix = (string, guildPrefix) => {
    return string.replace(/PREFIX/g, guildPrefix);
};

module.exports = {
    name: "help",
    category: "Misc",
    aliases: ["h"],
    description: "Get help on commands.",
    usage: "To get help on a specific command, use \`PREFIXhelp [command name]\` (without the [ ]).\nFor a full list of all commands, simply use \`PREFIXhelp\`.",
    examples: "\`PREFIXhelp ping\`",
    
    execute: async function(client, message, args) {
        let guildPrefix = client.guildInfoCache.get(message.guild.id).prefix;
        if (!args.length) {
            return defaultHelp(client, message, guildPrefix);
        }

        const queryName = args.join(' ').toLowerCase()
        const command = client.commands.get(queryName) || client.commands.find(c => c.aliases && c.aliases.includes(queryName));
        const category = client.categories.get(queryName)

        if (command) {
            
            let hEmbed = new MessageEmbed()
            .setTitle(`${command.name}`)
            .setAuthor(command.category ? command.category : 'No category')
            .setColor(EMBED_COLOR)
            .setTimestamp()
            
            if (command.description) hEmbed.setDescription(replacePrefix(command.description, guildPrefix))
            if (command.usage) hEmbed.addField("Usage", replacePrefix(command.usage, guildPrefix))
            if (command.aliases && command.aliases.length !== 0) hEmbed.addField("Aliases", '`' + command.aliases.join('`, `') + '`')
            if (command.examples) hEmbed.addField("Examples", replacePrefix(command.examples, guildPrefix))
            if (client.guildInfoCache.get(message.guild.id).disabledCommands.includes(command.name)) hEmbed.setAuthor('This command is currently disabled in this server.')
            
            message.channel.send(hEmbed);
        } else if (category) {
            let hEmbed = new MessageEmbed()
            .setTitle(category[0])
            .setColor(EMBED_COLOR)
            .setTimestamp()
            .setDescription('`' + category.slice(1).join('`, `') + '`')

            message.channel.send(hEmbed)
        } else defaultHelp(client, message, guildPrefix)
    }
}

function defaultHelp(client, message, guildPrefix) {
    let hEmbed = new MessageEmbed()
    .setTitle("Command Categories")
    .setColor(EMBED_COLOR)
    .setDescription(`Use \`${guildPrefix}help [category]\` to get more info on a category, for example: \`${guildPrefix}help misc\``)
    .setTimestamp()
    .setThumbnail(client.user.displayAvatarURL())
    .addField('Categories', client.categories.map(c => '> ' + c[0]).join('\n\n'))

    message.channel.send(hEmbed);
}