import Discord from "discord.js";
import { Client } from "../types";

module.exports = async (client: Client, role: Discord.Role) => {
  let guildInfo = client.guildInfoCache.get(role.guild.id)!;
  if (!guildInfo) {
    const fetch = await client.DBGuild.findByIdAndUpdate(
      role.guild.id,
      {},
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    //@ts-ignore
    guildInfo = {};
    guildInfo.prefix = fetch.prefix;
    if (fetch.disabledCommands)
      guildInfo.disabledCommands = fetch.disabledCommands;
    if (fetch.commandPerms) guildInfo.commandPerms = fetch.commandPerms;
    if (fetch.commandCooldowns)
      guildInfo.commandCooldowns = fetch.commandCooldowns;
    client.guildInfoCache.set(role.guild.id, guildInfo);
  }

  let commandCooldowns = guildInfo.commandCooldowns || {};

  for (const command of Object.keys(commandCooldowns)) {
    //@ts-ignore
    if (!commandCooldowns[command][role.id]) continue;
    //@ts-ignore
    delete commandCooldowns[command][role.id];

    if (Object.keys(commandCooldowns[command]).length === 0)
      delete commandCooldowns[command];
  }

  await client.DBGuild.findByIdAndUpdate(
    role.guild.id,
    { $set: { commandCooldowns: commandCooldowns } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  guildInfo.commandCooldowns = commandCooldowns;
  client.guildInfoCache.set(role.guild.id, guildInfo);
};
