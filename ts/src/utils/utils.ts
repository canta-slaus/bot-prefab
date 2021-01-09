import Discord, { MessageEmbed } from "discord.js";
import { Client, Argument, Command } from "../types";
import embedColors from "../../config/colors.json"
const reactions = ['⏪', '◀️', '⏸️', '▶️', '⏩', '🔢'];
const consoleColors = {
    "SUCCESS": "\u001b[32m",
    "WARNING": "\u001b[33m",
    "ERROR": "\u001b[31m"
}

function processArguments(
    message: Discord.Message,
    msgArgs: string[],
    expectedArgs: Argument[]
):
    [
      | string
      | Discord.Role
      | Discord.Channel
      | Discord.GuildMember
      | Discord.MessageAttachment
    ]
    | { invalid: true; prompt: string | undefined }
  {
    let counter = 0;
    let amount, num, role, member, channel;
    const processedArgs: any[] = msgArgs;

    for (const argument of expectedArgs) {
        amount = argument.amount ? ( argument.amount <= 0 ? 1 : argument.amount ) : 1

        for (var i = 0; i < amount; i++) {
        switch (argument.type) {
            case "NUMBER":
                num = Number(processedArgs[counter]);
                if (!processedArgs[counter] || isNaN(num)) {
                    return { invalid: true, prompt: argument.prompt };
                } else processedArgs[counter] = num;
                break;

            case "INTEGER":
                if (
                    isNaN(processedArgs[counter]) ||
                    isNaN(parseFloat(processedArgs[counter]))
                ) {
                    return { invalid: true, prompt: argument.prompt };
                }
                processedArgs[counter] = parseInt(processedArgs[counter]);
                break;

            case "CHANNEL":
                if (!processedArgs[counter]) {
                    return { invalid: true, prompt: argument.prompt };
                }
                if (
                    processedArgs[counter].startsWith("<#") &&
                    processedArgs[counter].endsWith(">")
                ) processedArgs[counter] = processedArgs[counter].slice(2, -1);
                channel = message.guild!.channels.cache.get(processedArgs[counter]);
                if (!channel) {
                    return { invalid: true, prompt: argument.prompt };
                }
                processedArgs[counter] = channel;
                break;

            case "ROLE":
                if (!processedArgs[counter]) {
                    return { invalid: true, prompt: argument.prompt };
                }
                if (
                    processedArgs[counter].startsWith("<@&") &&
                    processedArgs[counter].endsWith(">")
                ) processedArgs[counter] = processedArgs[counter].slice(3, -1);
                role = message.guild!.roles.cache.get(processedArgs[counter]);
                if (!role) {
                    return { invalid: true, prompt: argument.prompt };
                }
                processedArgs[counter] = role;
                break;

            case "AUTHOR_OR_MEMBER":
                if (
                    processedArgs[counter] &&
                    (processedArgs[counter].startsWith("<@") ||
                    (processedArgs[counter].startsWith("<@!") &&
                        processedArgs[counter].endsWith(">")))
                ) processedArgs[counter] = processedArgs[counter]
                    .replace("<@", "")
                    .replace("!", "")
                    .replace(">", "");
                member = message.guild!.member(processedArgs[counter]);
                if (!member) processedArgs[counter] = message.member;
                else processedArgs[counter] = member;
                if (argument.returnUsers) processedArgs[counter] = processedArgs[counter].user;
                break;

            case "ROLE_OR_MEMBER":
                if (!processedArgs[counter]) {
                    return { invalid: true, prompt: argument.prompt };
                }
                if (
                    processedArgs[counter].startsWith("<@&") &&
                    processedArgs[counter].endsWith(">")
                )
                    processedArgs[counter] = processedArgs[counter].slice(3, -1);
                role = message.guild!.roles.cache.get(processedArgs[counter]);
                if (!role) {
                    if (
                    processedArgs[counter].startsWith("<@") ||
                    (processedArgs[counter].startsWith("<@!") &&
                        processedArgs[counter].endsWith(">"))
                    )
                    processedArgs[counter] = processedArgs[counter]
                        .replace("<@", "")
                        .replace("!", "")
                        .replace(">", "");
                    member = message.guild!.member(processedArgs[counter]);
                    if (!member) return { invalid: true, prompt: argument.prompt };
                    else processedArgs[counter] = member;
                } else processedArgs[counter] = role;
                break;

            case "SOMETHING":
                if (!processedArgs[counter]) {
                    return { invalid: true, prompt: argument.prompt };
                }
                break;

            case "MEMBER":
                if (!processedArgs[counter]) {
                    return { invalid: true, prompt: argument.prompt };
                }
                if (
                    processedArgs[counter].startsWith("<@") ||
                    (processedArgs[counter].startsWith("<@!") &&
                    processedArgs[counter].endsWith(">"))
                )
                    processedArgs[counter] = processedArgs[counter]
                    .replace("<@", "")
                    .replace("!", "")
                    .replace(">", "");
                member = message.guild!.member(processedArgs[counter]);
                if (!member) {
                    return { invalid: true, prompt: argument.prompt };
                } else processedArgs[counter] = member;
                break;

            case "IMAGE":
                if (message.attachments.array().length === 0) {
                    return { invalid: true, prompt: argument.prompt };
                }
                processedArgs[counter] = message.attachments.array()[0];
                break;

            default:
                log("WARNING", "src/utils/utils.ts", `processArguments: the argument type '${argument.type}' doesn't exist`);
            }
            counter++;
        }
    }
    return processedArgs as [
        | string
        | Discord.Role
        | Discord.Channel
        | Discord.GuildMember
        | Discord.MessageAttachment
    ];
}

async function blacklist(client: Client, userID: string) {
    if (client.blacklistCache.has(userID)) return;
    await client.DBConfig.findByIdAndUpdate("blacklist", { $push: { blacklisted: userID } }, { new: true, upsert: true, setDefaultsOnInsert: true });
    client.blacklistCache.add(userID);
}

async function whitelist(client: Client, userID: string) {
    if (!client.blacklistCache.has(userID)) return;
    await client.DBConfig.findByIdAndUpdate("blacklist", { $pull: { blacklisted: userID } }, { new: true, upsert: true, setDefaultsOnInsert: true });
    client.blacklistCache.delete(userID);
}

async function paginate(
    message: Discord.Message,
    embeds: Discord.MessageEmbed[],
    options: { time: number }
) {
    const pageMsg = await message.channel.send({ embed: embeds[0] });

    let stop = false;

    for (const emote of reactions) {
        if (stop) return;
        await pageMsg.react(emote).catch((e) => (stop = true));
    }

    let pageIndex = 0;
    let time = 30000;
    const filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
        return (
        reactions.includes(reaction.emoji.name) && user.id === message.author.id
        );
    };

    if (options) {
        if (options.time) time = options.time;
    }

    if (pageMsg.deleted) return;

    const collector = pageMsg.createReactionCollector(filter, { time: time });
    collector.on('collect', async (reaction, user) => {
        reaction.users.remove(user)
        if (reaction.emoji.name === '⏩') {
            pageIndex = embeds.length - 1
            await pageMsg.edit({ embed:embeds[pageIndex] })
        } else if (reaction.emoji.name === '▶️') {
            if (pageIndex < embeds.length - 1) {
                pageIndex++
                await pageMsg.edit({ embed: embeds[pageIndex] })
            } else {
                pageIndex = 0
                await pageMsg.edit({ embed: embeds[pageIndex] })
            }
        } else if (reaction.emoji.name === '⏸️') {
            await pageMsg.delete()
        } else if (reaction.emoji.name === '⏪') {
            pageIndex = 0
            await pageMsg.edit({ embed: embeds[pageIndex] })
        } else if (reaction.emoji.name === '◀️') {
            if (pageIndex > 0) {
                pageIndex--
                await pageMsg.edit({ embed: embeds[pageIndex] })
            } else {
                pageIndex = embeds.length - 1
                await pageMsg.edit({ embed: embeds[pageIndex] })
            }
        } else if (reaction.emoji.name === '🔢') {
            let reply = await getReply(message, { time: 7500, regexp: /^\d+$/ })
            if (!reply) return;

            let num = parseInt(reply.content)

            if (num > embeds.length) num = embeds.length - 1
            else num--

            pageIndex = num

            if (pageMsg.deleted) return;
            await pageMsg.edit({ embed: embeds[pageIndex] })
        }
    });

    collector.on('end', () => {
        if (pageMsg.deleted) return;
        pageMsg.reactions.removeAll().catch(err => console.log(err));
    });
}

async function getReply(
    message: Discord.Message,
    options?: {
        time?: number;
        user?: Discord.User;
        words?: string[];
        regexp?: RegExp;
    }
) {
    let time = 30000;
    let user = message.author;
    let words: string[] = [];
    if (options) {
        if (options.time) time = options.time;
        if (options.user) user = options.user;
        if (options.words) words = options.words;
    }
    const filter = (msg: Discord.Message) => {
        return (
        msg.author.id === user.id &&
        (words.length === 0 || words.includes(msg.content.toLowerCase())) &&
        (!options || !options.regexp || options.regexp.test(msg.content))
        );
    };
    const msgs = await message.channel.awaitMessages(filter, {
        max: 1,
        time: time,
    });
    if (msgs.size > 0) return msgs.first();
    return false;
}

function randomRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function msToTime(ms: number) {
    let day, hour, minute, seconds;
    seconds = Math.floor(ms / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return day ?
        (hour ?
            (`${day}d ${hour}h ${minute}m ${seconds}s`) :
            (minute ?
                (`${day}d ${minute}m ${seconds}s`) :
                (`${day}d ${seconds}s`))) :
        (hour ?
            (`${hour}h ${minute}m ${seconds}s`) :
            (minute ?
                (`${minute}m ${seconds}s`) :
                (`${seconds}s`)))
}

function missingPermissions(
    member: Discord.GuildMember,
    perms: Discord.PermissionResolvable
) {
    const missingPerms = member.permissions.missing(perms).map(
        (str) =>
        `\`${str
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b(\w)/g, (char) => char.toUpperCase())}\``
    );

    return missingPerms.length > 1
        ? `${missingPerms.slice(0, -1).join(", ")} and ${missingPerms.slice(-1)[0]}`
        : missingPerms[0];
}

function log(type: "SUCCESS"|"ERROR"|"WARNING", path: string, text: string) {
    console.log(`\u001b[36;1m<bot-prefab>\u001b[0m\u001b[34m [${path}]\u001b[0m - ${consoleColors[type]}${text}\u001b[0m`);
}

class CustomEmbed extends MessageEmbed {
    constructor(data: { client: Client, userID: string }) {
        super();
        let userInfo = data.client.userInfoCache.get(data.userID);
        if (!userInfo) {
            data.client.DBUser.findById(data.userID).then(d => userInfo = d!);
            if (!userInfo) userInfo = { language: 'english', embedColor: 'default' };
            data.client.userInfoCache.set(data.userID, userInfo);
        }

        //@ts-ignore
        this.setColor(embedColors[userInfo.embedColor]);
    }
}

function getCooldown(client: Client, command: Command, message: Discord.Message) {
    let guildInfo = client.guildInfoCache.get(message.guild!.id);
    let cd = command.cooldown;
    if (guildInfo!.commandCooldowns && guildInfo!.commandCooldowns[command.name]) {
        let roles = Object.keys(guildInfo!.commandCooldowns[command.name]);
        let highestRole = message.member!.roles.cache.filter(role => roles.includes(role.id)).sort((a, b) =>  b.position - a.position).first();
        if (highestRole) cd = guildInfo!.commandCooldowns[command.name][highestRole.id] / 1000;
    }

    return cd;
}

function setCooldown(client: Client, command: Command, message: Discord.Message) {
    const cd = getCooldown(client, command, message);

    if (!cd) return;

    let cooldowns;
    if (typeof command.globalCooldown === 'undefined' || command.globalCooldown) {
        if (!client.globalCooldowns.has(command.name)) client.globalCooldowns.set(command.name, new Discord.Collection());
        cooldowns = client.globalCooldowns;
    } else {
        if (!client.serverCooldowns.has(message.guild!.id)) client.serverCooldowns.set(message.guild!.id, new Discord.Collection());
        cooldowns = client.serverCooldowns.get(message.guild!.id);
        if (!cooldowns!.has(command.name)) cooldowns!.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns!.get(command.name);
    const cooldownAmount = cd * 1000;

    timestamps!.set(message.author.id, now);
    setTimeout(() => timestamps!.delete(message.author.id), cooldownAmount);
}

export {
    processArguments,
    blacklist,
    whitelist,
    paginate,
    log,
    getReply,
    randomRange,
    delay,
    msToTime,
    missingPermissions,
    CustomEmbed,
    getCooldown,
    setCooldown
};
