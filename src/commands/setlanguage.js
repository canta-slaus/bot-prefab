const languages = require('../../config/languages.json')
const langs = Object.keys(languages)

/**
 * @type {import('../typings.d').Command}
 */
module.exports = {
    name: "setlanguage",
    category: "Utility",
    aliases: ["sl"],
    clientPerms: ['SEND_MESSAGES'],

    execute: async function(client, message, args) {
        let userInfo = client.userInfoCache.get(message.author.id)
        if (!userInfo) {
            userInfo = await client.DBUser.findByIdAndUpdate(message.author.id, {  }, { new: true, upsert: true, setDefaultsOnInsert: true })
            delete userInfo._id
            client.userInfoCache.set(message.author.id, userInfo)
        }

        if (!args[0]) {
            message.channel.send(`${message.author.tag}, your current set language is \`${userInfo.language}\`.\nThese are the supported languages:\n\`${langs.join('`, `')}\``)
        } else {
            args[0] = args[0].toLowerCase()
            if (!langs.includes(args[0])) return message.channel.send(`${message.author.tag}, the language \`${args[0]}\` doesn't exist.`)

            userInfo.language = args[0]
            message.channel.send(`${message.author.tag}, your language has been changed to \`${args[0]}\``)
            await client.DBUser.findByIdAndUpdate(message.author.id, { $set: { language: args[0] } })
        }
    }
}
