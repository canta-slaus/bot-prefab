const PREFIX = require("../../config/config.json").PREFIX;

export default {
  name: "ping",
  category: "Misc",
  aliases: ["pong"],
  description: "Get the bots current ping.",
  usage: "`PREFIXping`",
  clientPerms: ["SEND_MESSAGES"],

  async execute(client, message, args) {
    const msg = await message.channel.send("Ping?");
    await msg.edit(
      `Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms.`
    );
  },
};
