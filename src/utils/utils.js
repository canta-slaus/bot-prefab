module.exports = class Util {
    static processArguments(message, expectedArgs, msgArgs) {
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
                default:
                    return console.log(`The argument type ${argument.type} doesn't exist.`);
            }
            counter++
        }
        return msgArgs;
    }
}