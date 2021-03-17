//@ts-check

const colors = require('../../config/colors.json');
const { setCooldown, getUserInfo } = require('../utils/utils');
const cls = Object.keys(colors);

/**
 * @type {import('../typings.d').Command}
 */
module.exports = {
    name: "setcolor",
    category: "Utility",
    aliases: ["sc"],
    clientPerms: ['SEND_MESSAGES'],

    execute: async function({ client, message, args }) {
        setCooldown(client, this, message);
    
        let userInfo = await getUserInfo(client, message.author.id);

        if (!args[0]) {
            message.channel.send(`${message.author.tag}, your current embed color is \`${userInfo.embedColor}\`.\nThese are the available colors:\n\`${cls.join('`, `')}\``);
        } else {
            args[0] = args[0].toLowerCase();
            if (!cls.includes(args[0])) return message.channel.send(`${message.author.tag}, the embed color \`${args[0]}\` doesn't exist.`);

            message.channel.send(`${message.author.tag}, your embed color has been changed to \`${args[0]}\``);
            userInfo = await client.DBUser.findByIdAndUpdate(message.author.id, { $set: { embedColor: args[0] } }, { new: true, upsert: true, setDefaultsOnInsert: true });
            client.userInfoCache.set(message.author.id, userInfo);
        }
    }
}
