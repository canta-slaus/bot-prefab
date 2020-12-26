const EMBED_COLOR = require('../../config/config.json').EMBED_COLOR;
const { msToTime } = require('../utils/utils.js');
const languages = require('../../config/languages.json');
const { MessageEmbed, Message } = require("discord.js");

const replacePrefix = (string, guildPrefix) => {
    return string.replace(/PREFIX/g, guildPrefix);
};

/**
 * @type {import('../typings.d').Command}
 */
module.exports = {
    name: "help",
    category: "Misc",
    aliases: ["h"],
    clientPerms: ['SEND_MESSAGES', 'EMBED_LINKS'],
    
    execute: async function(client, message, args) {
        let guildInfo = client.guildInfoCache.get(message.guild.id)
        let guildPrefix = guildInfo.prefix

        let userInfo = client.userInfoCache.get(message.author.id) 
        if (!userInfo) {
            userInfo = await client.DBUser.findById(message.author.id)
            if (!userInfo) userInfo = { language: 'english' }
            client.userInfoCache.set(message.author.id, userInfo)
        }

        let language = userInfo.language

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
            .setTimestamp();
            
            if (languages[language][command.name].description) hEmbed.setDescription(replacePrefix(languages[language][command.name].description, guildPrefix))

            if (languages[language][command.name].usage) hEmbed.addField("Usage", replacePrefix(languages[language][command.name].usage, guildPrefix))

            if (command.aliases && command.aliases.length !== 0) hEmbed.addField("Aliases", '`' + command.aliases.join('`, `') + '`')

            if (languages[language][command.name].examples) hEmbed.addField("Examples", replacePrefix(languages[language][command.name].examples, guildPrefix))

            let cd;
            if (command.cooldown) cd = command.cooldown
            if (guildInfo.commandCooldowns && guildInfo.commandCooldowns[command.name]) {
                let roles = Object.keys(guildInfo.commandCooldowns[command.name])
                let highestRole = message.member.roles.cache.filter(role => roles.includes(role.id)).sort((a, b) =>  b.position - a.position).first()
                if (highestRole) cd = guildInfo.commandCooldowns[command.name][highestRole.id]
            }
            if (cd) hEmbed.addField("Cooldown", `${msToTime(cd * 1000)}`)

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

/**
 * Default help message method
 * @param {import('../typings.d').myClient} client 
 * @param {Message} message 
 * @param {string} guildPrefix 
 */
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