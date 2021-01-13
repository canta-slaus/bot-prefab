const { Message, User, MessageEmbed, GuildMember, PermissionResolvable, Guild, Collection, GuildChannel, Role, MessageAttachment } = require("discord.js");
const ms = require("ms")
const embedColors = require('../../config/colors.json')
const reactions = ['⏪', '◀️', '⏸️', '▶️', '⏩', '🔢']
const consoleColors = {
    "SUCCESS": "\u001b[32m",
    "WARNING": "\u001b[33m",
    "ERROR": "\u001b[31m"
}
const hasAmount = [ "SOMETHING", "NUMBER", "CHANNEL", "ROLE", "MEMBER" ];

/**
 * Function to check if the user has passed in the proper arguments when using a command
 * @param {Message} message - The message to check the arguments for
 * @param {string[]} msgArgs - The arguments given by the user
 * @param {import('../typings.d').Arguments} expectedArgs - The expected arguments for the command
 * @returns {import('../typings.d').Flags} Returns the arguments mapped by their ID's if all the arguments were as expected, else, returns `undefined/false`
 */
function processArguments(message, msgArgs, expectedArgs) {
    let counter = 0;
    let amount, num, role, member, channel, attach, time;
    let flags = {  };

    for (const argument of expectedArgs) {
        if (hasAmount.includes(argument.type)) amount = (argument.amount && argument.amount > 1) ? argument.amount : 1;
        else amount = 1;

        for (var i = 0; i < amount; i++) {
            switch (argument.type) {
                case "SOMETHING":
                    if (!msgArgs[counter]) return { invalid: true, prompt: argument.prompt };

                    if (argument.words && !argument.words.includes(msgArgs[counter].toLowerCase())) return { invalid: true, prompt: argument.prompt };
                    else if (argument.regexp && !argument.regexp.test(msgArgs[counter])) return { invalid: true, prompt: argument.prompt };

                    if (amount == 1) flags[argument.id] = msgArgs[counter];
                    else if (flags[argument.id]) flags[argument.id].push(msgArgs[counter]);
                    else flags[argument.id] = [msgArgs[counter]];
                    break;

                case "NUMBER":
                    num = Number(msgArgs[counter]);
                    if (!msgArgs[counter] || isNaN(num)) return { invalid: true, prompt: argument.prompt };
                    
                    if (argument.min && argument.min > num) return { invalid: true, prompt: argument.prompt };

                    if (argument.max && argument.max < num) return { invalid: true, prompt: argument.prompt };

                    if (argument.toInteger) num = parseInt(num);

                    if (amount == 1) flags[argument.id] = num;
                    else if (flags[argument.id]) flags[argument.id].push(num);
                    else flags[argument.id] = [num];
                    break;

                case "CHANNEL":
                    if (!msgArgs[counter]) return { invalid: true, prompt: argument.prompt };

                    if (msgArgs[counter].startsWith("<#") && msgArgs[counter].endsWith(">")) channel = message.guild.channels.cache.get(msgArgs[counter].slice(2, -1));
                    else channel = message.guild.channels.cache.get(msgArgs[counter]);

                    if (!channel) return { invalid: true, prompt: argument.prompt };

                    if (argument.channelTypes && !argument.channelTypes.includes(channel.type)) return { invalid: true, prompt: argument.prompt };

                    if (amount == 1) flags[argument.id] = channel;
                    else if (flags[argument.id]) flags[argument.id].push(channel);
                    else flags[argument.id] = [channel];
                    break;

                case "ROLE":
                    if (!msgArgs[counter]) return { invalid: true, prompt: argument.prompt };
    
                    if (msgArgs[counter].startsWith("<@&") && msgArgs[counter].endsWith(">")) role = message.guild.roles.cache.get(msgArgs[counter].slice(3, -1));
                    else role = message.guild.roles.cache.get(msgArgs[counter]);

                    if (!role) return { invalid: true, prompt: argument.prompt };

                    if (argument.notBot && role.managed) return { invalid: true, prompt: argument.prompt };

                    if (amount == 1) flags[argument.id] = role;
                    else if (flags[argument.id]) flags[argument.id].push(role);
                    else flags[argument.id] = [role];
                    break;

                case "AUTHOR_OR_MEMBER":
                    if (msgArgs[counter] && (msgArgs[counter].startsWith("<@") || msgArgs[counter].startsWith("<@!") && msgArgs[counter].endsWith(">"))) member = message.guild.member(msgArgs[counter].replace("<@", "").replace("!", "").replace(">", ""));
                    else member = message.guild.member(msgArgs[counter]);

                    if (!member) flags[argument.id] = message.member;
                    else flags[argument.id] = member;
    
                    if (argument.toUser) flags[argument.id] = flags[argument.id].user;
                    break;

                case "MEMBER":
                    if (!msgArgs[counter]) return { invalid: true, prompt: argument.prompt };

                    if ((msgArgs[counter].startsWith("<@") || msgArgs[counter].startsWith("<@!") && msgArgs[counter].endsWith(">"))) member = message.guild.member(msgArgs[counter].replace("<@", "").replace("!", "").replace(">", ""));
                    else member = message.guild.member(msgArgs[counter]);

                    if (!member) return { invalid: true, prompt: argument.prompt };
                    else {
                        if (argument.notBot && member.user.bot) return { invalid: true, prompt: argument.prompt };

                        if (argument.notSelf && member.id === message.author.id) return { invalid: true, prompt: argument.prompt };
                        
                        if (argument.toUser) member = member.user;
                        
                        if (amount == 1) flags[argument.id] = member;
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

                    flags[argument.id] = attach.first();
                    break;

                case "TIME":
                    if (!msgArgs[counter]) return { invalid: true, prompt: argument.prompt };

                    time = msgArgs.slice(counter).join("").match(/(\d*)(\D*)/g);
                    time.pop();

                    num = 0;
                    for (var i = 0; i < time.length; i++) {
                        try {
                            num += ms(time[i]);
                        } catch (e) {
                            return { invalid: true, prompt: argument.prompt };
                        }
                    }

                    if (argument.min && num < argument.min) return { invalid: true, prompt: argument.prompt };

                    if (argument.max && num > argument.max) return { invalid: true, prompt: argument.prompt };

                    flags[argument.id] = num;
                    break;
                default:
                    log("WARNING", "src/utils/utils.js", `processArguments: the argument type '${argument.type}' doesn't exist`);
            }
            counter++
        }
    }
    return flags;
}

/**
 * Function to glocally blacklist a user
 * @param {import('../typings.d').myClient} client - The client object (because the schemas are stored to it)
 * @param {string} userID - The ID of the user to whitelist 
 */
async function blacklist(client, userID) {
    if (client.blacklistCache.has(userID)) return
    await client.DBConfig.findByIdAndUpdate('blacklist', { $push: { 'blacklisted': userID } }, { new: true, upsert: true, setDefaultsOnInsert: true })
    client.blacklistCache.add(userID)
}

/**
 * Function to globally whitelist a previously blacklisted user
 * @param {import('../typings.d').myClient} client - The client object (because the schemas are stored to it)
 * @param {string} userID - The ID of the user to whitelist 
 */
async function whitelist(client, userID) {
    if (!client.blacklistCache.has(userID)) return
    await client.DBConfig.findByIdAndUpdate('blacklist', { $pull: { 'blacklisted': userID } }, { new: true, upsert: true, setDefaultsOnInsert: true })
    client.blacklistCache.delete(userID)
}

/**
 * Function to automatically send paginated embeds and switch between the pages by listening to the user reactions
 * @param {Message} message - Used to send the paginated message to the channel, get the user, etc.
 * @param {MessageEmbed[]} embeds - The array of embeds to switch between
 * @param {object} [options] - Optional parameters
 * @param {number} [options.time] - The max time for createReactionCollector after which all of the reactions disappear
 * @example Examples can be seen in `src/utils/utils.md`
 */
async function paginate(message, embeds, options) {
    try {
        const pageMsg = await message.channel.send({ embed: embeds[0] });

        for (const emote of reactions) {
            await pageMsg.react(emote);
        }

        let pageIndex = 0;
        let time = 30000;
        const filter = (reaction, user) => {
            return reactions.includes(reaction.emoji.name) && user.id === message.author.id;
        };

        if (options) {
            if (options.time) time = options.time
        };

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
                let num = await getReply(message, { time: 7500, regexp: /^\d+$/ })
                if (!num) return;

                num = parseInt(num.content)

                if (num > embeds.length) num = embeds.length - 1
                else num--

                pageIndex = num

                await pageMsg.edit({ embed: embeds[pageIndex] })
            }
        });

        collector.on('end', () => {
            pageMsg.reactions.removeAll()
        });
    } catch (e) {
        return;
    }
}

/**
 * Function to await a reply from a specific user.
 * @param {Message} message - The message to listen to
 * @param {object} [options] - Optional parameters
 * @param {number} [options.time] - The max time for awaitMessages 
 * @param {User} [options.user] - The user to listen to messages to
 * @param {string[]} [options.words] - Optional accepted words, will aceept any word if not provided
 * @param {RegExp} [options.regexp] - Optional RegExp to accept user input that matches the RegExp
 * @return {Promise<Message|Boolean>} Returns the `message` sent by the user if there was one, returns `false` otherwise.
 * @example const reply = await getReply(message, { time: 10000, words: ['yes', 'y', 'n', 'no'] })
 */
async function getReply(message, options) {
    let time = 30000
    let user = message.author
    let words = []
    if (options) {
        if (options.time) time = options.time
        if (options.user) user = options.user
        if (options.words) words = options.words
    }
    const filter = msg => {
        return msg.author.id === user.id
               && (words.length === 0 || words.includes(msg.content.toLowerCase()))
               && (!options || !options.regexp || options.regexp.test(msg.content))
    }
    const msgs = await message.channel.awaitMessages(filter, { max: 1, time: time })
    if (msgs.size > 0) return msgs.first()
    return false
}

/**
 * Return an random integer between `min` and `max` (both inclusive)
 * @param {number} min - The lower bound
 * @param {number} max - The upper bound
 * @return {number}
 * @example const rand = randomRange(0, 10)
 */
function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Function to set a timeout
 * @param {number} ms - Time to wait in milliseconds
 * @return {promise}
 * @example await delay(5000)
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Function to convert milliseconds into readable time
 * @param {number} ms - The time in 
 * @return {string} Readable time as a string
 */
function msToTime(ms) {
    let day, hour, minute, seconds;
    seconds = Math.floor(ms / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return day ? (hour ? (`${day}d ${hour}h ${minute}m ${seconds}s`) : (minute ? (`${day}d ${minute}m ${seconds}s`) : (`${day}d ${seconds}s`))) :
                 (hour ? (`${hour}h ${minute}m ${seconds}s`) : (minute ? (`${minute}m ${seconds}s`) : (`${seconds}s`)))
}

/**
 * Function to get all missing permissions of a GuildMember
 * @param {GuildMember} member - The guild member whose missing permissions you want to get
 * @param {PermissionResolvable} perms - The permissions you want to check for
 * @return {string} Readable string containing all missing permissions
 */
function missingPermissions(member, perms){
    const missingPerms = member.permissions.missing(perms)
    .map(str=> `\`${str.replace(/_/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}\``)

    return missingPerms.length > 1 ?
    `${missingPerms.slice(0, -1).join(", ")} and ${missingPerms.slice(-1)[0]}` :
    missingPerms[0]
}

/**
 * Function to shorten down console logs
 * @param {('SUCCESS'|'WARNING'|'ERROR')} type - The type of log (SUCCESS, WARNING, ERROR)
 * @param {string} path - The path where the console log is coming from
 * @param {string} text - The message to be displayed
 */
function log(type, path, text) {
    console.log(`\u001b[36;1m<bot-prefab>\u001b[0m\u001b[34m [${path}]\u001b[0m - ${consoleColors[type]}${text}\u001b[0m`)
}

class CustomEmbed extends MessageEmbed {
    /**
     * Custom embed class
     * @param {object} data
     * @param {import('../typings.d').myClient} data.client 
     * @param {string} data.userID - The ID of the user you're constructing this embed for
     */
    constructor(data) {
        super()
        let userInfo = data.client.userInfoCache.get(data.userID) 
        if (!userInfo) {
            data.client.DBUser.findById(data.userID).then(d => userInfo = d)
            if (!userInfo) userInfo = { language: 'english', embedColor: 'default' }
            data.client.userInfoCache.set(data.userID, userInfo)
        }

        this.setColor(embedColors[userInfo.embedColor])
    }
}

/**
 * @param {import('../typings.d').myClient} client
 * @param {import('../typings.d').Command} command - The command you want to set a cooldown for
 * @param {Message} message - The guild ID the command is executed in
 * @return {(number|undefined)}
 */
function getCooldown(client, command, message) {
    let guildInfo = client.guildInfoCache.get(message.guild.id);
    let cd = command.cooldown;
    if (guildInfo.commandCooldowns && guildInfo.commandCooldowns[command.name]) {
        let roles = Object.keys(guildInfo.commandCooldowns[command.name]);
        let highestRole = message.member.roles.cache.filter(role => roles.includes(role.id)).sort((a, b) =>  b.position - a.position).first();
        if (highestRole) cd = guildInfo.commandCooldowns[command.name][highestRole.id] / 1000;
    }

    return cd;
}

/**
 * 
 * @param {import('../typings.d').myClient} client 
 * @param {import('../typings.d').Command} command 
 * @param {Message} message
 */
function setCooldown(client, command, message) {
    const cd = getCooldown(client, command, message);

    if (!cd) return;

    let cooldowns;
    if (typeof command.globalCooldown === 'undefined' || command.globalCooldown) {
        if (!client.globalCooldowns.has(command.name)) client.globalCooldowns.set(command.name, new Collection());
        cooldowns = client.globalCooldowns;
    } else {
        if (!client.serverCooldowns.has(message.guild.id)) client.serverCooldowns.set(message.guild.id, new Collection());
        cooldowns = client.serverCooldowns.get(message.guild.id);
        if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = cd * 1000;

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
}

module.exports = {
    processArguments, blacklist, whitelist, paginate, log,
    getReply, randomRange, delay, msToTime, missingPermissions,
    CustomEmbed, getCooldown, setCooldown
}