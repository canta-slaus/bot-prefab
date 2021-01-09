import { Command } from "../types";

export default {
    name: "ping",
    category: "Misc",
    aliases: ["pong"],
    clientPerms: ['SEND_MESSAGES'],
    
    async execute(client, message, args) {
        const msg = await message.channel.send("Ping?");
        await msg.edit(`Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms.`);
    }
} as Command;
