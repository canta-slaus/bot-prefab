const reactions = ['◀️', '▶️']

function processArguments(message, expectedArgs, msgArgs) {
    let counter = 0;
    let num, role, member, channel;
    for (const argument of expectedArgs) {
        if (!argument.type) return console.log("You didn't provide an argument type.");
        switch (argument.type) {
            case "NUMBER":
                num = Number(msgArgs[counter]);
                if (!msgArgs[counter] || isNaN(num)) {
                    if (argument.prompt) message.channel.send(argument.prompt);
                    return
                }
                else msgArgs[counter] = num;
                break;
            case "CHANNEL":
                if (!msgArgs[counter]) {
                    if (argument.prompt) message.channel.send(argument.prompt)
                    return
                }
                if (msgArgs[counter].startsWith("<#") && msgArgs[counter].endsWith(">")) msgArgs[counter] = msgArgs[counter].slice(2, -1)
                channel = message.guild.channels.cache.get(msgArgs[counter]);
                if (!channel) {
                    if (argument.prompt) message.channel.send(argument.prompt);
                    return
                };
                msgArgs[counter] = channel;
                break;
            case "ROLE":
                if (!msgArgs[counter]) {
                    if (argument.prompt) message.channel.send(argument.prompt)
                    return
                }
                if (msgArgs[counter].startsWith("<@&") && msgArgs[counter].endsWith(">")) msgArgs[counter] = msgArgs[counter].slice(3, -1)
                role = message.guild.roles.cache.get(msgArgs[counter])
                if (!role) {
                    if (argument.prompt) message.channel.send(argument.prompt)
                    return
                }
                msgArgs[counter] = role;
                break;
            case "AUTHOR_OR_MEMBER":
                if (msgArgs[counter] && (msgArgs[counter].startsWith("<@") || msgArgs[counter].startsWith("<@!") && msgArgs[coutner].endsWith(">"))) msgArgs[counter] = msgArgs[counter].replace("<@", "").replace("!", "").replace(">", "")
                member = message.guild.members.cache.get(msgArgs[counter])
                if (!member) msgArgs[counter] = message.member
                else msgArgs[counter] = member
                break;
            case "ROLE_OR_MEMBER":
                if (!msgArgs[counter]) {
                    if (argument.prompt) message.channel.send(argument.prompt)
                    return
                }
                if (msgArgs[counter].startsWith("<@&") && msgArgs[counter].endsWith(">")) msgArgs[counter] = msgArgs[counter].slice(3, -1)
                role = message.guild.roles.cache.get(msgArgs[counter])
                if (!role) {
                    if ((msgArgs[counter].startsWith("<@") || msgArgs[counter].startsWith("<@!") && msgArgs[coutner].endsWith(">"))) msgArgs[counter] = msgArgs[counter].replace("<@", "").replace("!", "").replace(">", "")
                    member = message.guild.members.cache.get(msgArgs[counter])
                    if (!member) return
                    else msgArgs[counter] = member
                } else msgArgs[counter] = role
                break;
            case "STRING":
                if (!msgArgs[counter]) {
                    if (argument.prompt) message.channel.send(argument.prompt)
                    return
                }
                break;
            case "MEMBER":
                if (!msgArgs[counter]) {
                    if (argument.prompt) message.channel.send(argument.prompt)
                    return
                }
                if ((msgArgs[counter].startsWith("<@") || msgArgs[counter].startsWith("<@!") && msgArgs[coutner].endsWith(">"))) msgArgs[counter] = msgArgs[counter].replace("<@", "").replace("!", "").replace(">", "")
                member = message.guild.members.cache.get(msgArgs[counter])
                if (!member) return
                else msgArgs[counter] = member
                break;
            default:
                return console.log(`The argument type ${argument.type} doesn't exist.`);
        }
        counter++
    }
    return msgArgs;
}

async function blacklist(client, userID) {
    if (client.blacklistCache.has(userID)) return
    await client.DBConfig.findByIdAndUpdate('blacklist', {$push: {'blacklisted': userID}}, {new: true, upsert: true, setDefaultsOnInsert: true})
    client.blacklistCache.add(userID)
}

async function whitelist(client, userID) {
    if (!client.blacklistCache.has(userID)) return
    await client.DBConfig.findByIdAndUpdate('blacklist', {$pull: {'blacklisted': userID}}, {new: true, upsert: true, setDefaultsOnInsert: true})
    client.blacklistCache.delete(userID)
}

async function paginate(message, embeds, options) {
    const pageMsg = await message.channel.send({ embed: embeds[0] })
    await pageMsg.react(reactions[0])
    await pageMsg.react(reactions[1])

    let pageIndex = 0;
    let time = 30000;
    const filter = (reaction, user) => {
        return reactions.includes(reaction.emoji.name) && user.id === message.author.id;
    };
    if (options) {
        if (options.time) time = options.time
    }
    const collector = pageMsg.createReactionCollector(filter, { time: time });
    collector.on('collect', (reaction, user) => {
        reaction.users.remove(user)
        if (reaction.emoji.name === '▶️' && pageIndex < embeds.length - 1) {
            pageIndex++
            pageMsg.edit({ embed: embeds[pageIndex] })
        } else if (reaction.emoji.name === '◀️' && pageIndex > 0) {
            pageIndex--
            pageMsg.edit({ embed: embeds[pageIndex] })
        }
    });
}

module.exports = {
    processArguments, blacklist, whitelist, paginate
}