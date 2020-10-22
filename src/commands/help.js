const PREFIX = require('../../config/config.json').PREFIX;
const EMBED_COLOR = require('../../config/config.json').EMBED_COLOR;
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'help',
    aliases: ["h", "commands"],
    description: "Get help on commands.",
    usage: `To get help on a specific command, use \`${PREFIX}help [command name]\` (without the [ ]).\nFor a full list of all commands, simply use \`${PREFIX}help\`.`,
    examples: `\`${PREFIX}help ping\``,
    
    execute: async function(client, message, args) {
        if (!args.length) {
            let hEmbed = new MessageEmbed()
            .setTitle("Command Categories")
            .setColor(EMBED_COLOR)
            .setDescription(`Use \`${PREFIX}help [command name]\` to get more info on a specific command, for example: \`${PREFIX}help ping\``)
            .addField("Misc", "`help`, `ping`")
	        .setTimestamp()
            await message.channel.send(hEmbed);
        }
        else {
            const cmdname = args[0].toLowerCase();
            const command = client.commands.get(cmdname) || client.commands.find(c => c.aliases && c.aliases.includes(cmdname));

            if (!command) return message.channel.send(`${message.author.username}, that\'s not a valid command!`)

            let hEmbed = new MessageEmbed()
            .setTitle(`${command.name}`)
            .setColor(EMBED_COLOR)
            .setDescription(`${command.description}`)
            .addField("Usage", `${command.usage}`)
            .setTimestamp()
            if (command.aliases.length !== 0) hEmbed.addField("Aliases", `${command.aliases.join(', ')}`)
            if (command.examples) hEmbed.addField("Examples", `${command.examples}`)
            message.channel.send(hEmbed);
        }
    }
}