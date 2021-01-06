const { Message, User, MessageEmbed, GuildMember, PermissionResolvable } = require("discord.js");
const embedColors = require('../../config/colors.json')
const reactions = ['⏪', '◀️', '⏸️', '▶️', '⏩', '🔢']
const consoleColors = {
    "SUCCESS": "\u001b[32m",
    "WARNING": "\u001b[33m",
    "ERROR": "\u001b[31m"
}

/**
 * Function to check if the user has passed in the proper arguments when using a command
 * @param {Message} message - The message to check the arguments for
 * @param {string[]} msgArgs - The arguments given by the user
 * @param {import('../typings.d').argument[]} expectedArgs - The expected arguments for the command
 * @returns {ProcessedArguments} Returns the arguments array if all the arguments were as expected, else, returns `undefined/false`
 */
function processArguments(message, msgArgs, expectedArgs) {
    if (!Array.isArray(expectedArgs)) return log("WARNING", "src/utils/utils.js", "processArguments: expectedArgs has to be an array");

    let counter = 0;
    let amount, num, role, member, channel;

    for (const argument of expectedArgs) {
        if (typeof argument !== "object" || argument === null) return log("WARNING", "src/utils/utils.js", "processArguments: argument is not an object");

        if (!argument.type) return log("WARNING", "src/utils/utils.js", "processArguments: no argument type was provided");

        if (typeof argument.type !== "string") return log("WARNING", "src/utils/utils.js", "processArguments: argument type is not a string")

        amount = isNaN(argument.amount) ? 1 : ( parseInt(argument.amount) <= 0 ? 1 : parseInt(argument.amount) )
        
        for (var i = 0; i < amount; i++) {
            switch (argument.type) {
                case "NUMBER":
                    num = Number(msgArgs[counter]);
                    if (!msgArgs[counter] || isNaN(num)) {
                        return msgArgs = { invalid: true, prompt: argument.prompt }
                    }
                    else msgArgs[counter] = num;
                    break;

                case "INTEGER":
                    if (isNaN(msgArgs[counter]) || isNaN(parseFloat(msgArgs[counter]))) {
                        return msgArgs = { invalid: true, prompt: argument.prompt }
                    }
                    msgArgs[counter] = parseInt(msgArgs[counter]);
                    break;

                case "CHANNEL":
                    if (!msgArgs[counter]) {
                        return msgArgs = { invalid: true, prompt: argument.prompt }
                    }
                    if (msgArgs[counter].startsWith("<#") && msgArgs[counter].endsWith(">")) msgArgs[counter] = msgArgs[counter].slice(2, -1)
                    channel = message.guild.channels.cache.get(msgArgs[counter]);
                    if (!channel) {
                        return msgArgs = { invalid: true, prompt: argument.prompt }
                    };
                    msgArgs[counter] = channel;
                    break;

                case "ROLE":
                    if (!msgArgs[counter]) {
                        return msgArgs = { invalid: true, prompt: argument.prompt }
                    }
                    if (msgArgs[counter].startsWith("<@&") && msgArgs[counter].endsWith(">")) msgArgs[counter] = msgArgs[counter].slice(3, -1)
                    role = message.guild.roles.cache.get(msgArgs[counter])
                    if (!role) {
                        return msgArgs = { invalid: true, prompt: argument.prompt }
                    }
                    msgArgs[counter] = role;
                    break;

                case "AUTHOR_OR_MEMBER":
                    if (msgArgs[counter] && (msgArgs[counter].startsWith("<@") || msgArgs[counter].startsWith("<@!") && msgArgs[counter].endsWith(">"))) msgArgs[counter] = msgArgs[counter].replace("<@", "").replace("!", "").replace(">", "")
                    member = message.guild.member(msgArgs[counter])
                    if (!member) msgArgs[counter] = message.member
                    else msgArgs[counter] = member
                    if (argument.returnUsers) msgArgs[counter] = msgArgs[counter].user
                    break;

                case "ROLE_OR_MEMBER":
                    if (!msgArgs[counter]) {
                        return msgArgs = { invalid: true, prompt: argument.prompt }
                    }
                    if (msgArgs[counter].startsWith("<@&") && msgArgs[counter].endsWith(">")) msgArgs[counter] = msgArgs[counter].slice(3, -1)
                    role = message.guild.roles.cache.get(msgArgs[counter])
                    if (!role) {
                        if ((msgArgs[counter].startsWith("<@") || msgArgs[counter].startsWith("<@!") && msgArgs[counter].endsWith(">"))) msgArgs[counter] = msgArgs[counter].replace("<@", "").replace("!", "").replace(">", "")
                        member = message.guild.member(msgArgs[counter])
                        if (!member) return msgArgs = { invalid: true, prompt: argument.prompt }
                        else msgArgs[counter] = member
                    } else msgArgs[counter] = role
                    break;

                case "SOMETHING":
                    if (!msgArgs[counter]) {
                        return msgArgs = { invalid: true, prompt: argument.prompt }
                    }
                    break;

                case "MEMBER":
                    if (!msgArgs[counter]) {
                        return msgArgs = { invalid: true, prompt: argument.prompt }
                    }
                    if ((msgArgs[counter].startsWith("<@") || msgArgs[counter].startsWith("<@!") && msgArgs[counter].endsWith(">"))) msgArgs[counter] = msgArgs[counter].replace("<@", "").replace("!", "").replace(">", "")
                    member = message.guild.member(msgArgs[counter])
                    if (!member) {
                        return msgArgs = { invalid: true, prompt: argument.prompt }
                    }
                    else msgArgs[counter] = member
                    break;

                case "IMAGE":
                    if (message.attachments.array().length === 0) {
                        return msgArgs = { invalid: true, prompt: argument.prompt }
                    }
                    msgArgs[counter] = message.attachments.array()[0]
                    break;

                default:
                    return log("WARNING", "src/utils/utils.js", `processArguments: the argument type '${argument.type}' doesn't exist`);
            }
            counter++
        }
    }
    return msgArgs;
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
    const pageMsg = await message.channel.send({ embed: embeds[0] });

    let stop = false;

    for (const emote of reactions) {
        if (stop) return;
        await pageMsg.react(emote).catch(e => stop = true);
    }

    let pageIndex = 0;
    let time = 30000;
    const filter = (reaction, user) => {
        return reactions.includes(reaction.emoji.name) && user.id === message.author.id;
    };

    if (options) {
        if (options.time) time = options.time
    };

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
            let num = await getReply(message, { time: 7500, regexp: /^\d+$/ })
            if (!num) return;

            num = parseInt(num.content)

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

/**
 * Function to await a reply from a specific user.
 * @param {Message} message - The message to listen to
 * @param {object} [options] - Optional parameters
 * @param {number} [options.time] - The max time for awaitMessages 
 * @param {User} [options.user] - The user to listen to messages to
 * @param {string[]} [options.words] - Optional accepted words, will aceept any word if not provided
 * @param {RegExp} [options.regexp] - Optional RegExp to accept user input that matches the RegExp
 * @return {(Message|Boolean)} Returns the `message` sent by the user if there was one, returns `false` otherwise.
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
                 (hour ? (` ${hour}h ${minute}m ${seconds}s`) : (minute ? (`${minute}m ${seconds}s`) : (`${seconds}s`)))
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

module.exports = {
    processArguments, blacklist, whitelist, paginate, log,
    getReply, randomRange, delay, msToTime, missingPermissions,
    CustomEmbed
}