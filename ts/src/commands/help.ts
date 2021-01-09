import { Command, Client } from "../types";
import languages from "../../config/languages.json";
import { msToTime, CustomEmbed } from "../utils/utils";
import { Message, Collection } from "discord.js";

const replacePrefix = (string: string, guildPrefix: string) => {
    return string.replace(/PREFIX/g, guildPrefix);
};

export default {
    name: "help",
    category: "Misc",
    aliases: ["h"],
    clientPerms: ['SEND_MESSAGES', 'EMBED_LINKS'],

    async execute(client, message, args) {
        let guildInfo = client.guildInfoCache.get(message.guild!.id);
        let guildPrefix = guildInfo!.prefix;

        let userInfo = client.userInfoCache.get(message.author.id) ;
        if (!userInfo) {
            //@ts-ignore
            userInfo = await client.DBUser.findById(message.author.id);
            if (!userInfo) userInfo = { language: 'english', embedColor: 'default' };
            client.userInfoCache.set(message.author.id, userInfo);
        }

        let language = userInfo.language;
        //@ts-ignore
        let languageHelp = languages[language].help.names

        if (!args.length) {
            return defaultHelp(client, message, guildPrefix, languageHelp);
        }

        const queryName = args.join(' ').toLowerCase()
        const command = client.commands.get(queryName) || (guildInfo!.commandAlias ? client.commands.get(guildInfo!.commandAlias[queryName]) : false)

        const category = client.categories.get(queryName)

        let hEmbed = new CustomEmbed({ client: client, userID: message.author.id })

        if (command && !command.hideCommand) {
            //@ts-ignore
            let commandHelp = languages[language][command.name]
            hEmbed
            .setTitle(`${command.name}`)
            .setAuthor(command.category ? command.category : languageHelp.noCategory)
            .setTimestamp();
            
            if (commandHelp.description) hEmbed.setDescription(replacePrefix(commandHelp.description, guildPrefix))

            if (commandHelp.usage) hEmbed.addField(languageHelp.usage, replacePrefix(commandHelp.usage, guildPrefix))

            let customAliases = getCommandAliases(client, message.guild!.id, command.name)
            let aliases = [  ] as string[];
            if (command.aliases && command.aliases.length !== 0) aliases = aliases.concat(command.aliases)
            if (customAliases && customAliases.length !== 0) aliases = aliases.concat(customAliases)
            if (aliases.length > 0) hEmbed.addField(languageHelp.aliases, '`' + aliases.join('`, `') + '`')

            if (commandHelp.examples) hEmbed.addField(languageHelp.examples, replacePrefix(commandHelp.examples, guildPrefix))

            let cd;
            if (command.cooldown) cd = command.cooldown * 1000
            if (guildInfo!.commandCooldowns && guildInfo!.commandCooldowns[command.name]) {
                let roles = Object.keys(guildInfo!.commandCooldowns[command.name])
                let highestRole = message.member!.roles.cache.filter(role => roles.includes(role.id)).sort((a, b) =>  b.position - a.position).first()
                if (highestRole) cd = guildInfo!.commandCooldowns[command.name][highestRole.id]
            }
            if (cd) hEmbed.addField(languageHelp.cooldown, `${msToTime(cd)}`)

            if (client.guildInfoCache.get(message.guild!.id)!.disabledCommands.includes(command.name)) hEmbed.setAuthor(languageHelp.isDisabled)
            
            message.channel.send(hEmbed);
        } else if (category) {
            hEmbed
            .setTitle(category[0])
            .setTimestamp()
            .setDescription('`' + category.slice(1).join('`, `') + '`')

            message.channel.send(hEmbed)
        } else defaultHelp(client, message, guildPrefix, languageHelp)
    }
} as Command;

function defaultHelp(client: Client, message: Message, guildPrefix: string, languageHelp: any) {
    let hEmbed = new CustomEmbed({ client: client, userID: message.author.id })
    .setTitle(languageHelp.commandCategories)
    .setDescription(replacePrefix(languageHelp.categoriesHelp, guildPrefix))
    .setTimestamp()
    .setThumbnail(client.user!.displayAvatarURL())
    .addField(languageHelp.categoriesName, client.categories.map(c => '> ' + languageHelp.categories[c[0]]).join('\n\n'))

    message.channel.send(hEmbed);
}

function getCommandAliases(client: Client, guildId: string, commandName: string) {
    let guildInfo = client.guildInfoCache.get(guildId)
    let commandAlias = guildInfo!.commandAlias ? Object.entries(guildInfo!.commandAlias) : [  ]

    let commands = new Collection<string, string[]>();
    for (let [alias, command] of commandAlias) {
        let aliases = commands.get(command)

        if (!aliases || aliases.length === 0) aliases = [alias]
        else aliases.push(alias)

        commands.set(command, aliases)
    }
    return commands.get(commandName)
}