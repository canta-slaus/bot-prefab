# Discord.js Bot Prefab
**DISCLAIMER: If you are new to Discord.js and JavaScript in general, then don't even bother trying to understand how this prefab works. You should have at least decent knowledge about how Discord bots work and know some basic JS. If you have any question or spot any mistakes, shoot me a DM on Discord: canta#5556.**\
**_Don't DM me asking how to do this and that command, I will only help you with using the bot prefab, not with specific commands._**

## What is this?
This is a bot prefab to make creating bots a bit easier, it has a fairly simple command and event handler and plenty of commands ([`src/commands`](src/commands)). I made this because I don't think writing the whole handler yourself is neccesary to make a Discord bot, although you should at least try to understand how it all works to make it easier to debug.\
The _help_ command is already set up to send a help message for other commands.

## Available Features
- Per server prefixes
- Per server command disabling/enabling and customizable per server command permissions
- Per server custom command aliases
- Per server custom command cooldowns for certain roles
- Global blacklisting/whitelisting of users
- Pagination function and more quality of life features

## How to use this?
### First steps
First of all, either clone the repo by downloading the zip or using GIT. Then run `npm init` and `npm i`, though this prefab only requires discord.js and a few additional packages only so far.
Then, go to [`config/config.json`](config/config.json) and add your bot token, the default prefix to use and your MongoDB URI, as well as other information. Now you can simply start the bot using either node (`node .`) or nodemon (`nodemon .`).\
Personally, I suggest using nodemon.

### How to add new commands
To add a new command, simply create a new file inside the [`src/commands`](src/commands) folder (you can also put them into subfolders and so on). Then head over to [`src/utils/prefab.js`](src/utils/prefab.js). `prefab.js` is a command template that you can copy and paste to make creating commands easier and faster (who wants to type the same couple lines over and over, anyway). The prefab file comes with some comments at the very bottom of it, make sure to read the comments to get an understanding of all the properties of a command.
### How to add new events
To listen to new events, create a new file within [`src/eventHandlers`](src/eventHandlers) and with the event name as the file name, e.g. `guildMemberAdd.js` (keep in mind that you need to enable priveleged intents in order to listen to this event). Then inside that file, add
```js
module.exports = async (client, member) => {
    console.log('Someone joined a server!')
}
```
The ClientUser will be passed on by the event handler, just add how many parameters the event provides and you're good to go.
Another example: `messageReactionAdd.js`
```js
module.exports = async (client, messageReaction, user) => {
    console.log('Someone reacted to a message!')
}
```
### How to use blacklisting/whitelisting/pagination etc.
There are explanations and examples in [`src/utils/utils.md`](src/utils/utils.md).
## What now?
If you have any suggestions for new features or encounter any bugs from the prefab itself; my DMs are always open.
