import { Command } from "../types";
import colors from "../../config/colors.json";
import { setCooldown } from "../utils/utils";
const cls = Object.keys(colors)

export default {
    name: "setcolor",
    category: "Utility",
    aliases: ["sc"],
    clientPerms: ['SEND_MESSAGES'],
    
    async execute({ client, message, args }) {
        setCooldown(client, this, message);
        let userInfo = client.userInfoCache.get(message.author.id)
        if (!userInfo) {
            userInfo = await client.DBUser.findByIdAndUpdate(message.author.id, {  }, { new: true, upsert: true, setDefaultsOnInsert: true })
            //@ts-ignore
            delete userInfo._id
            client.userInfoCache.set(message.author.id, userInfo)
        }

        if (!args[0]) {
            message.channel.send(`${message.author.tag}, your current embed color is \`${userInfo.embedColor}\`.\nThese are the available colors:\n\`${cls.join('`, `')}\``)
        } else {
            args[0] = args[0].toLowerCase()
            if (!cls.includes(args[0])) return message.channel.send(`${message.author.tag}, the embed color \`${args[0]}\` doesn't exist.`)

            userInfo.embedColor = args[0]
            message.channel.send(`${message.author.tag}, your embed color has been changed to \`${args[0]}\``)
            await client.DBUser.findByIdAndUpdate(message.author.id, { $set: { embedColor: args[0] } }, { new: true, upsert: true, setDefaultsOnInsert: true })
        }
    }
} as Command;
