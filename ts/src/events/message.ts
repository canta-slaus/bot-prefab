import Discord from "discord.js";
import { devs, someServers } from "../../config/config.json";
import { Client } from "../types";
import {
    log,
    missingPermissions,
    msToTime,
    processArguments,
} from "../utils/utils";

const globalCooldowns = new Discord.Collection<
    string,
    Discord.Collection<string, number>
>();

const serverCooldowns = new Discord.Collection<
    string,
    Discord.Collection<string, Discord.Collection<string, number>>
>();

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

        let cd = command.cooldown;
        if (guildInfo.commandCooldowns && guildInfo.commandCooldowns[command.name]) {
            let roles = Object.keys(guildInfo.commandCooldowns[command.name]);
            let highestRole = message.member!.roles.cache.filter((role) => roles.includes(role.id)).sort((a, b) => b.position - a.position).first();
            if (highestRole)
                cd = guildInfo.commandCooldowns[command.name][highestRole.id] / 1000;
        }

        let cooldowns;
        if (cd) {
        if (typeof command.globalCooldown === 'undefined' || command.globalCooldown) {
            if (!globalCooldowns.has(command.name)) globalCooldowns.set(command.name, new Discord.Collection<string, number>());
            cooldowns = globalCooldowns;
        } else {
            if (!serverCooldowns.has(message.guild!.id)) serverCooldowns.set(message.guild!.id, new Discord.Collection<string, Discord.Collection<string, number>>())
            cooldowns = serverCooldowns.get(message.guild!.id)
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

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
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
