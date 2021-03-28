import Discord, { MessageEmbed } from "discord.js";
//@ts-ignore
import ms from "ms";
import { Client, Arguments, Command, Flags } from "../types";
import embedColors from "../../config/colors.json"
const reactions = ['⏪', '◀️', '⏸️', '▶️', '⏩', '🔢'];
const consoleColors = {
    "SUCCESS": "\u001b[32m",
    "WARNING": "\u001b[33m",
    "ERROR": "\u001b[31m"
}
const hasAmount = [ "SOMETHING", "NUMBER", "CHANNEL", "ROLE", "MEMBER" ];

function processArguments(
    message: Discord.Message,
    msgArgs: string[],
    expectedArgs: Arguments
):
    Flags | { invalid: boolean, prompt: string | undefined }
  {
    let counter = 0;
    let amount, num, role, member, channel, attach, time;
    let flags: Flags = {  };

    for (const argument of expectedArgs) {
        //@ts-ignore
        if (hasAmount.includes(argument.type)) amount = (argument.amount && argument.amount > 1) ? argument.amount : 1;
        else amount = 1;

        for (var i = 0; i < amount; i++) {
            switch (argument.type) {
                case "SOMETHING":
                    if (!msgArgs[counter]) return { invalid: true, prompt: argument.prompt };

                    if (argument.words && !argument.words.includes(msgArgs[counter].toLowerCase())) return { invalid: true, prompt: argument.prompt };
                    else if (argument.regexp && !argument.regexp.test(msgArgs[counter])) return { invalid: true, prompt: argument.prompt };

                    if (amount == 1) flags[argument.id] = msgArgs[counter];
                    //@ts-ignore
                    else if (flags[argument.id]) flags[argument.id].push(msgArgs[counter]);
                    else flags[argument.id] = [msgArgs[counter]];
                    break;

                case "NUMBER":
                    num = Number(msgArgs[counter]);
                    if (!msgArgs[counter] || isNaN(num)) return { invalid: true, prompt: argument.prompt };
                    
                    if (argument.min && argument.min > num) return { invalid: true, prompt: argument.prompt };

                    if (argument.max && argument.max < num) return { invalid: true, prompt: argument.prompt };

                    //@ts-ignore
                    if (argument.toInteger) num = parseInt(num);

                    if (amount == 1) flags[argument.id] = num;
                    //@ts-ignore
                    else if (flags[argument.id]) flags[argument.id].push(num);
                    else flags[argument.id] = [num];
                    break;

                case "CHANNEL":
                    if (!msgArgs[counter]) return { invalid: true, prompt: argument.prompt };

                    if (msgArgs[counter].startsWith("<#") && msgArgs[counter].endsWith(">")) channel = message.guild!.channels.cache.get(msgArgs[counter].slice(2, -1));
                    else channel = message.guild!.channels.cache.get(msgArgs[counter]);

                    if (!channel) return { invalid: true, prompt: argument.prompt };

                    if (argument.channelTypes && !argument.channelTypes.includes(channel.type)) return { invalid: true, prompt: argument.prompt };

                    if (amount == 1) flags[argument.id] = channel;
                    //@ts-ignore
                    else if (flags[argument.id]) flags[argument.id].push(channel);
                    else flags[argument.id] = [channel];
                    break;

                case "ROLE":
                    if (!msgArgs[counter]) return { invalid: true, prompt: argument.prompt };
    
                    if (msgArgs[counter].startsWith("<@&") && msgArgs[counter].endsWith(">")) role = message.guild!.roles.cache.get(msgArgs[counter].slice(3, -1));
                    else role = message.guild!.roles.cache.get(msgArgs[counter]);

                    if (!role) return { invalid: true, prompt: argument.prompt };

                    if (argument.notBot && role.managed) return { invalid: true, prompt: argument.prompt };

                    if (amount == 1) flags[argument.id] = role;
                    //@ts-ignore
                    else if (flags[argument.id]) flags[argument.id].push(role);
                    else flags[argument.id] = [role];
                    break;

                case "AUTHOR_OR_MEMBER":
                    if (msgArgs[counter] && (msgArgs[counter].startsWith("<@") || msgArgs[counter].startsWith("<@!") && msgArgs[counter].endsWith(">"))) member = message.guild!.member(msgArgs[counter].replace("<@", "").replace("!", "").replace(">", ""));
                    else member = message.guild!.member(msgArgs[counter]);

                    if (!member) flags[argument.id] = message.member!;
                    else flags[argument.id] = member;
    
                    //@ts-ignore
                    if (argument.toUser) flags[argument.id] = flags[argument.id].user;
                    break;

                case "MEMBER":
                    if (!msgArgs[counter]) return { invalid: true, prompt: argument.prompt };

                    if ((msgArgs[counter].startsWith("<@") || msgArgs[counter].startsWith("<@!") && msgArgs[counter].endsWith(">"))) member = message.guild!.member(msgArgs[counter].replace("<@", "").replace("!", "").replace(">", ""));
                    else member = message.guild!.member(msgArgs[counter]);

                    if (!member) return { invalid: true, prompt: argument.prompt };
                    else {
                        if (argument.notBot && member.user.bot) return { invalid: true, prompt: argument.prompt };

                        if (argument.notSelf && member.id === message.author.id) return { invalid: true, prompt: argument.prompt };
                        
                        if (argument.toUser) member = member.user;
                        
                        if (amount == 1) flags[argument.id] = member;
                        //@ts-ignore
                        else if (flags[argument.id]) flags[argument.id].push(member);
                        else flags[argument.id] = [member];
                    }
                    break;

                case "ATTACHMENT":
                    if (message.attachments.size === 0) return { invalid: true, prompt: argument.prompt };

                    attach = message.attachments.filter(a => {
                        let accepted = false;

                        argument.attachmentTypes.forEach(type => {
                            if (a.proxyURL.endsWith(type)) accepted = true;
                        });

                        return accepted;
                    });

                    if (attach.size === 0) return { invalid: true, prompt: argument.prompt };

                    flags[argument.id] = attach.first()!;
                    break;

                case "TIME":
                    if (!msgArgs[counter]) return { invalid: true, prompt: argument.prompt };

                    time = msgArgs.slice(counter).join("").match(/(\d*)(\D*)/g);
                    time!.pop();

                    num = 0;
                    for (var i = 0; i < time!.length; i++) {
                        try {
                            num += ms(time![i]);
                        } catch (e) {
                            return { invalid: true, prompt: argument.prompt };
                        }
                    }

                    if (argument.min && num < argument.min) return { invalid: true, prompt: argument.prompt };

                    if (argument.max && num > argument.max) return { invalid: true, prompt: argument.prompt };

                    flags[argument.id] = num;
                    break;
                default:
                    //@ts-ignore
                    log("WARNING", "src/utils/utils.js", `processArguments: the argument type '${argument.type}' doesn't exist`);
            }
            counter++
        }
    }
    return flags;
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

function getGuildInfo(client: Client, guildID: string) {
    let guildInfo = client.guildInfoCache.get(guildID);

    if (!guildInfo) {
        guildInfo = await client.DBGuild.findByIdAndUpdate(guildID, {  }, { new: true, upsert: true, setDefaultsOnInsert: true });
        client.guildInfoCache.set(guildID, guildInfo);
    }

    return guildInfo;
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
    setCooldown,
    getGuildInfo
};
