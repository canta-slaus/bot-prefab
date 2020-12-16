const EMBED_COLOR = require('../../config/config.json').EMBED_COLOR;
const { MessageEmbed } = require('discord.js');
const { getReply } = require('../utils/utils');

const permissions = {
    'a': 'CREATE_INSTANT_INVITE',
    'b': 'CREATE_INSTANT_INVITE',
    'c': 'KICK_MEMBERS',
    'd': 'BAN_MEMBERS',
    'e': 'ADMINISTRATOR',
    'f': 'MANAGE_CHANNELS',
    'g': 'MANAGE_GUILD',
    'h': 'ADD_REACTIONS',
    'i': 'VIEW_AUDIT_LOG',
    'j': 'PRIORITY_SPEAKER',
    'k': 'STREAM',
    'l': 'VIEW_CHANNEL',
    'm': 'SEND_MESSAGES',
    'n': 'SEND_TTS_MESSAGES',
    'o': 'MANAGE_MESSAGES',
    'p': 'EMBED_LINKS',
    'q': 'ATTACH_FILES',
    'q': 'READ_MESSAGE_HISTORY',
    'r': 'MENTION_EVERYONE',
    's': 'USE_EXTERNAL_EMOJIS',
    't': 'VIEW_GUILD_INSIGHTS',
    'u': 'CONNECT',
    'v': 'SPEAK',
    'w': 'MUTE_MEMBERS',
    'x': 'DEAFEN_MEMBERS',
    'y': 'MOVE_MEMBERS',
    'z': 'USE_VAD',
    '0': 'CHANGE_NICKNAME',
    '1': 'MANAGE_NICKNAMES',
    '2': 'MANAGE_ROLES',
    '3': 'MANAGE_WEBHOOKS',
    '4': 'MANAGE_EMOJIS',
}

const permsRegEx = /^[0-4a-zA-Z]{1,31}$/

module.exports = {
    name: "permissions",
    category: "Utility",
    aliases: ["p"],
    description: "Set your own custom permissions that your users need to run this command in your server.",
    usage: "- \`PREFIXpermissions [command]\` to display and change the permissions someone needs to use this command.",
    serverOwnerOnly: true,
    arguments: [
        {
            type: 'SOMETHING',
            prompt: 'Please specify a command.'
        }
    ],
    clientPerms: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],

    execute: async function(client, message, args) {
        const command = client.commands.get(args[0].toLowerCase())
        if (!command) return message.channel.send(`${message.author.username}, that command doesn't exist.`)

        let guildInfo = client.guildInfoCache.get(message.guild.id)
        let commandPerms = guildInfo.commandPerms;

        const embed = new MessageEmbed()
        .setColor(EMBED_COLOR)
        .setTimestamp()
        .setTitle(`Command permissions for: ${command.name}`)
        .setFooter('React with 🔁 to override the permissions.')

        if (!commandPerms || !commandPerms[command.name]) {
            if (command.perms && command.perms.length !== 0) embed.setDescription('\`' + command.perms.join('\`, \`') + '\`')
            else embed.setDescription('You don\'t need any permissions to run this command.')
        } else {
            embed.setDescription('\`' + commandPerms[command.name].join('\`, \`') + '\`')
        }

        const msg = await message.channel.send(embed)
        await msg.react('🔁')

        const filter = (reaction, user) => {
            return reaction.emoji.name === '🔁' && user.id === message.author.id;
        };
        const collector = msg.createReactionCollector(filter, { time: 30000, max: 1 });

        collector.on('end', async (collected) => {
            if (collected.size === 0) return message.channel.send(`${message.author.username}, sorry, if you want to change the permissions, run the command again and react in time.`);

            let text = "";

            const a = Object.entries(permissions)

            for (var i = 0; i < a.length; i++) {
                text += `\`${a[i][0]}\` - \`${a[i][1]}\`\n`
            }

            text += 'Reply with the permissions that you want users to have in order to use this command, '
            text += 'e.g.: \`cd2\` If you want them to have the permissions to kick members, ban members and manage roles in order to use this command.\n'
            text += 'Reply with \`clear\` to reset permissions.'

            embed.setFooter('')
            .setDescription(text)
            message.channel.send(embed)

            const perms = await getReply(message);
            if (!perms) return message.channel.send(`${message.author.username}, sorry, time is up!`)

            const update = {}
            if (perms.content.toLowerCase() === 'clear') {
                update[`commandPerms.${command.name}`] = ""
                await client.DBGuild.findByIdAndUpdate(message.guild.id, { $unset: update }, { new: true, upsert: true, setDefaultsOnInsert: true })

                if (guildInfo.commandPerms) {
                    delete guildInfo['commandPerms'][command.name]
                    client.guildInfoCache.set(message.guild.id, guildInfo)
                }
            } else {
                if (!permsRegEx.test(perms.content)) return message.channel.send(`${message.author.username}, sorry, that isn't a valid permission string.`)

                const permsArray = []
                for (var i = 0; i < perms.content.length; i++) {
                    if (permsArray.includes(permissions[perms.content[i]])) continue;
                    permsArray.push(permissions[perms.content[i]])
                }

                update[`commandPerms.${command.name}`] = permsArray
                guildInfo.commandPerms = guildInfo.commandPerms ? guildInfo.commandPerms : {}
                guildInfo.commandPerms[command.name] = permsArray
                client.guildInfoCache.set(message.guild.id, guildInfo)
                await client.DBGuild.findByIdAndUpdate(message.guild.id, { $set: update }, { new: true, upsert: true, setDefaultsOnInsert: true })
            }
            message.channel.send(`${message.author.username}, the permissions for ${command.name} have been overwritten.`)
        })
    }
}
