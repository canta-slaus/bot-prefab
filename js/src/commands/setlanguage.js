//@ts-check

const languages = require('../../config/languages.json');
const { setCooldown, getUserInfo } = require('../utils/utils');
const langs = Object.keys(languages);

/**
 * @type {import('../typings.d').Command}
 */
module.exports = {
    name: "setlanguage",
    category: "Utility",
    aliases: ["sl"],
    clientPerms: ['SEND_MESSAGES'],

    execute: async function({ client, message, args }) {
        setCooldown(client, this, message);

        let userInfo = await getUserInfo(client, message.author.id);

        if (!args[0]) {
            message.channel.send(`${message.author.tag}, your current set language is \`${userInfo.language}\`.\nThese are the supported languages:\n\`${langs.join('`, `')}\``);
        } else {
            args[0] = args[0].toLowerCase();
            if (!langs.includes(args[0])) return message.channel.send(`${message.author.tag}, the language \`${args[0]}\` doesn't exist.`);

            message.channel.send(`${message.author.tag}, your language has been changed to \`${args[0]}\``);
            userInfo = await client.DBUser.findByIdAndUpdate(message.author.id, { $set: { language: args[0] } });
            client.userInfoCache.set(message.author.id, userInfo);
        }
    }
}
