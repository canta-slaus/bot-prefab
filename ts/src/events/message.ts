import Discord from "discord.js";
import { devs, someServers } from "../../config/config.json";
import { Client } from "../types";
import {
    getCooldown,
    log,
    missingPermissions,
    msToTime,
    processArguments,
} from "../utils/utils";

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default async (client: Client, message: Discord.Message) => {
    try {
        if (
            message.author.bot ||
            message.channel.type === "dm" ||
            client.blacklistCache.has(message.author.id) ||
            message.webhookID
        ) return;

        let guildInfo = client.guildInfoCache.get(message.guild!.id)!;
        if (!guildInfo) {
            guildInfo = await client.DBGuild.findByIdAndUpdate(message.guild!.id, { }, { new: true, upsert: true, setDefaultsOnInsert: true });
            //@ts-ignore
            delete guildInfo._id
            client.guildInfoCache.set(message.guild!.id, guildInfo);
        }

        const prefixRegex = new RegExp(`^(<@!?${client.user!.id}>|${escapeRegex(guildInfo.prefix)})\\s*`);
        if (!prefixRegex.test(message.content)) return;

        //@ts-ignore
        const [, matchedPrefix] = message.content.match(prefixRegex);
        let msgargs = message.content.slice(matchedPrefix.length).trim().split(/ +/);
        let cmdName = msgargs.shift()!.toLowerCase();

        if (message.mentions.has(client.user!) && !cmdName) return message.channel.send(`My prefix is \`${guildInfo.prefix}\` or ${client.user}\nTo view a list of my commands, type either \`${guildInfo.prefix}help\` or \`@${client.user!.tag} help\``);

        const command = client.commands.get(cmdName) || (guildInfo.commandAlias ? client.commands.get(guildInfo.commandAlias[cmdName]) : false);

        if (!command) return;

        //@ts-ignore
        if (command.devOnly && !devs.includes(message.author.id)) return;

        //@ts-ignore
        if (command.someServersOnly && !someServers.includes(message.guild!.id)) return;
        if (command.serverOwnerOnly && message.guild!.ownerID !== message.author.id) return;

        if (guildInfo.disabledCommands.includes(command.name)) return;
        if (guildInfo.disabledChannels.includes(message.channel.id) && !command.ignoreDisabledChannels) return;

        if (command.clientPerms && !message.channel.permissionsFor(message.guild!.me!)!.has(command.clientPerms)) {
            return message.channel.send(`${message.author.username}, I am missing the following permissions: ${missingPermissions(message.guild!.me!, command.clientPerms)}`)
                .catch();
        }

        if (guildInfo.commandPerms && guildInfo.commandPerms[command.name] && !message.member!.hasPermission(guildInfo.commandPerms[command.name])) {
            return message.channel.send(`${message.author.username}, you are missing the following permissions: ${missingPermissions(message.member!, guildInfo.commandPerms[command.name])}`);
        } else if (command.perms && !message.member!.hasPermission(command.perms)) {
            return message.channel.send(`${message.author.username}, you are missing the following permissions: ${missingPermissions(message.member!, command.perms)}`);
        }

        const cd = getCooldown(client, command, message);

        let cooldowns;
        if (cd) {
            if (typeof command.globalCooldown === 'undefined' || command.globalCooldown) {
                if (!client.globalCooldowns.has(command.name)) client.globalCooldowns.set(command.name, new Discord.Collection<string, number>());
                cooldowns = client.globalCooldowns;
            } else {
                if (!client.serverCooldowns.has(message.guild!.id)) client.serverCooldowns.set(message.guild!.id, new Discord.Collection<string, Discord.Collection<string, number>>())
                cooldowns = client.serverCooldowns.get(message.guild!.id)
                if (!cooldowns!.has(command.name)) cooldowns!.set(command.name, new Discord.Collection<string, number>());
            }

            const now = Date.now();
            const timestamps = cooldowns!.get(command.name)!;
            const cooldownAmount = cd * 1000;
            if (timestamps.has(message.author.id)) {
                const expirationTime =
                timestamps.get(message.author.id)! + cooldownAmount;
                if (now < expirationTime)
                return message.channel.send(
                    `${message.author.username}, please wait \`${msToTime(
                    expirationTime - now
                    )}\` before using this command again.`
                );
            }
        }

        if (command.arguments && command.arguments.length !== 0)
            msgargs = processArguments(message, msgargs,
                command.arguments
            ) as any[];
        //@ts-ignore
        if (msgargs.invalid) return message.channel.send(msgargs.prompt);
        //@ts-ignore
        command.execute(client, message, msgargs);
    } catch (e) {
        log("ERROR", "src/eventHandlers/message.js", e.message);
    }
};
