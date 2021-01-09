# Discord.js Bot Prefab
**DISCLAIMER: If you are new to Discord.js and JavaScript in general, then don't even bother trying to understand how this prefab works. You should have at least decent knowledge about how Discord bots work and know some basic JS. If you have any question or spot any mistakes, shoot me a DM on Discord (canta#5556) or join my [server](https://discord.gg/j6SPS8227S).**\
**_Don't DM me asking how to do this and that command, I will only help you with using the bot prefab, not with specific commands._**

## What is this?
This is a feature-rich bot prefab to make creating bots a bit easier, it has a fairly simple command and event handler and plenty of commands ([`src/commands`](src/commands)). I made this because I don't think writing the whole handler yourself is neccesary to make a Discord bot, although you should at least try to understand how it all works to make it easier to debug.\
The _help_ command is already set up to send a help message for other commands.

## Available Features
- Per server prefixes
- Per server command disabling/enabling and customizable per server command permissions
- Per server custom command aliases
- Per server custom command cooldowns for certain roles
- Global blacklisting/whitelisting of users
- Pagination function and more quality of life features

# JavaScript and TypeScript
There is a [`JavaScript`](js) as well as a [`TypeScript`](ts) version of the prefab. Both offer the same features, use whichever language you prefer!