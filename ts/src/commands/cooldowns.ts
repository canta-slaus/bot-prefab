import { Command } from "../types";
import { CustomEmbed, msToTime, setCooldown } from "../utils/utils";
//@ts-ignore
import ms from "ms";

export default {
    name: "cooldowns",
    category: "Utility",
    aliases: ["cd"],
    serverOwnerOnly: true,
    arguments: [
        {
            type: 'SOMETHING',
            prompt: 'Please specify a command.',
            id: 'command'
        }
    ],
    clientPerms: ['SEND_MESSAGES', 'EMBED_LINKS'],

    async execute({ client, message, args, flags }) {
        //@ts-ignore
        const command = client.commands.get(flags.command.toLowerCase());
        if (!command) return message.channel.send(`${message.author.username}, that command doesn't exist.`);
        if (command.canNotSetCooldown) return message.channel.send(`${message.author.username}, you can not set a cooldown for this command.`);

        let guildInfo = client.guildInfoCache.get(message.guild!.id);
        let commandCooldowns = guildInfo!.commandCooldowns || {};
        
        const embed = new CustomEmbed({ client: client, userID: message.author.id })
        .setTimestamp()

        if (!args[1]) {
            setCooldown(client, this, message);
            if (!commandCooldowns || !commandCooldowns[command.name]) embed.setDescription('There are no modified cooldowns on this command.')
            else {
                let desc = ""
                for (const [role, cooldown] of Object.entries(commandCooldowns[command.name])) {
                    desc += `<@&${role}> ${msToTime(cooldown)}\n`
                }

                embed.setDescription(desc)
            }

            return message.channel.send(embed)
        }

        if (!args[2]) return message.channel.send(`${message.author.username}, please specify a role.`)

        let roleID = args[2].replace('<@&', '').replace('>', '')
        let role = message.guild!.roles.cache.get(roleID)
        if (!role) return message.channel.send(`${message.author.username}, please specify a role.`)

        const update = { commandCooldowns: { } }
        //@ts-ignore
        update.commandCooldowns[command.name] = { }

        setCooldown(client, this, message);
        switch (args[1].toLowerCase()) {
            case 'clear':
                if (commandCooldowns[command.name] && commandCooldowns[command.name][roleID]) {
                    delete commandCooldowns[command.name][roleID]
                    if (Object.keys(commandCooldowns[command.name]).length === 0) delete commandCooldowns[command.name]
                    update.commandCooldowns = commandCooldowns
                }

                embed.setDescription(`The cooldown for the role <@&${roleID}> has been reset to the default (\`${command.cooldown ? msToTime(command.cooldown) : 'No cooldown'}\`).`)
                break;
            case 'set':
                if (!args[3]) return message.channel.send(`${message.author.username}, please specify a cooldown.`)

                let time = ms(args.slice(3).join(''))
                if (time > 86400000) return message.channel.send(`${message.author.username}, the cooldown can't be longer than 24h.`)
                if ((command.cooldown ? command.cooldown : 0) === time / 1000) return message.channel.send(`${message.author.username}, that's already the default cooldown for this command.`)
                if (!commandCooldowns[command.name]) commandCooldowns[command.name] = { }
                commandCooldowns[command.name][roleID] = time

                update.commandCooldowns = commandCooldowns
                
                embed.setDescription(`The cooldown for the role <@&${roleID}> has been set to \`${msToTime(time)}\`.`)
                break;
            default:
                embed.setDescription(`${message.author.username}, please check the usage of this command.`)
                return message.channel.send(embed)
        }

        message.channel.send(embed)

        guildInfo!.commandCooldowns = commandCooldowns
        client.guildInfoCache.set(message.guild!.id, guildInfo!)
        await client.DBGuild.findByIdAndUpdate(message.guild!.id, { $set: update }, { new: true, upsert: true, setDefaultsOnInsert: true })
    }
} as Command;
