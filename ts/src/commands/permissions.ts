import { MessageReaction, PermissionString, User } from "discord.js";
import { Command } from "../types";
import { CustomEmbed, getReply } from "../utils/utils";

const permissions = {
    'a': 'ADMINISTRATOR',
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
    'r': 'READ_MESSAGE_HISTORY',
    's': 'MENTION_EVERYONE',
    't': 'USE_EXTERNAL_EMOJIS',
    'u': 'VIEW_GUILD_INSIGHTS',
    'v': 'CONNECT',
    'w': 'SPEAK',
    'x': 'MUTE_MEMBERS',
    'y': 'DEAFEN_MEMBERS',
    'z': 'MOVE_MEMBERS',
    '0': 'USE_VAD',
    '1': 'CHANGE_NICKNAME',
    '2': 'MANAGE_NICKNAMES',
    '3': 'MANAGE_ROLES',
    '4': 'MANAGE_WEBHOOKS',
    '5': 'MANAGE_EMOJIS',
};

const permsRegEx = /^[0-4a-zA-Z]{1,31}$/;

export default {
    name: "permissions",
    category: "Utility",
    aliases: ["p"],
    serverOwnerOnly: true,
    arguments: [
        {
            type: 'SOMETHING',
            prompt: 'Please specify a command.'
        }
    ],
    clientPerms: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
    
    async execute(client, message, args) {
        const command = client.commands.get(args[0].toLowerCase())
        if (!command) return message.channel.send(`${message.author.username}, that command doesn't exist.`)

        let guildInfo = client.guildInfoCache.get(message.guild!.id)
        let commandPerms = guildInfo!.commandPerms;

        const embed = new CustomEmbed({ client: client, userID: message.author.id })
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

        const filter = (reaction: MessageReaction, user: User) => {
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
                //@ts-ignore
                update[`commandPerms.${command.name}`] = ""
                await client.DBGuild.findByIdAndUpdate(message.guild!.id, { $unset: update }, { new: true, upsert: true, setDefaultsOnInsert: true })

                if (guildInfo!.commandPerms) {
                    delete guildInfo!['commandPerms'][command.name]
                    client.guildInfoCache.set(message.guild!.id, guildInfo!)
                }
            } else {
                if (!permsRegEx.test(perms.content)) return message.channel.send(`${message.author.username}, sorry, that isn't a valid permission string.`)

                const permsArray = [] as PermissionString[]
                for (var i = 0; i < perms.content.length; i++) {
                    //@ts-ignore
                    if (permsArray.includes(permissions[perms.content[i]])) continue;
                    //@ts-ignore
                    permsArray.push(permissions[perms.content[i]])
                }

                //@ts-ignore
                update[`commandPerms.${command.name}`] = permsArray
                guildInfo!.commandPerms = guildInfo!.commandPerms ? guildInfo!.commandPerms : {}
                guildInfo!.commandPerms[command.name] = permsArray
                client.guildInfoCache.set(message.guild!.id, guildInfo!)
                await client.DBGuild.findByIdAndUpdate(message.guild!.id, { $set: update }, { new: true, upsert: true, setDefaultsOnInsert: true })
            }
            message.channel.send(`${message.author.username}, the permissions for ${command.name} have been overwritten.`)
        })
    }
} as Command;
