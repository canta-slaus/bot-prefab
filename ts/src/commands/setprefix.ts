import { Command } from "../types";
import { setCooldown } from "../utils/utils";

const prefixRegExp = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{1,15}$/;

export default {
    name: "setprefix",
    category: "Utility",
    aliases: ["sp"],
    serverOwnerOnly: true,
    arguments: [
        {
            type: 'SOMETHING',
            prompt: 'Please enter a new prefix to use!'
        }
    ],
    clientPerms: ['SEND_MESSAGES'],
    
    async execute({ client, message, args }) {
        if (!prefixRegExp.test(args[0])) return message.channel.send(`${message.author.username}, that prefix doesn't follow the rules. Please try again.`)

        const guildInfo = client.guildInfoCache.get(message.guild!.id)
        if (guildInfo!.prefix === args[0]) return message.channel.send(`${message.author.username}, please make sure to enter a new prefix.`)

        setCooldown(client, this, message);
        await client.DBGuild.findByIdAndUpdate(message.guild!.id, {$set: { prefix: args[0]} }, { new: true, upsert: true, setDefaultsOnInsert: true });
        guildInfo!.prefix = args[0]
        client.guildInfoCache.set(message.guild!.id, guildInfo!)

        message.channel.send(`${message.author.username}, the new prefix is: \`${args[0]}\``)
    }
} as Command;
