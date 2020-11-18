# Discord.js Bot Prefab
**DISCLAIMER: If you are new to Discord.js and JavaScript in general, then don't even bother trying to understand how this prefab works. You should have at least decent knowledge about how Discord bots work and know some basic JS. If you have any question or spot any mistakes, shoot me a DM on Discord: canta#5556.**\
**_Don't DM me asking how to do this and that command, I will only help you with using the bot prefab, not with specific commands._**

## What is this?
This is a bot prefab to make creating bots a bit easier, it has a fairly simple command and event handler and two simple commands (_ping_ and _help_). I made this because I don't think writing the whole handler yourself is neccesary to make a Discord bot, although you should at least try to understand how it all works to make it easier to debug.\
The _help_ command is already set up to send a help message for other commands (more about that later).

## Available Features
- Per server prefixes
- Per server command disabling/enabling
- Global blacklisting/whitelisting of users
- Pagination function

## How to use this?
### First steps
First of all, either clone the repo by downloading the zip or using GIT. Then run `npm init` and `npm i`, though this prefab only requires discord.js only so far.
Then, go to `config/config.json` and add your bot token, the default prefix to use and your MongoDB URI. Now you can simply start the bot using either node (`node .`) or nodemon (`nodemon .`).\
Personally, I suggest using nodemon.

### How to add new commands
To add a new command, simply create a new file inside the `./src/commands` folder (you can also put them into subfolders and so on). Then head over to `./src/utils/prefab.js`. `prefab.js` is a command template that you can copy and paste to make creating commands easier and faster (who wants to type the same couple lines over and over, anyway). The prefab file comes with some comments at the very bottom of it, make sure to read the comments to get an understanding of all the properties of a command.
### How to add new events
To listen to new events, create a new file with the event name as the file name, e.g. `guildMemberAdd.js`. Then inside that file, add
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
### How to blacklist/whitelist users
A blacklisted user will not be able to use any command from your bot and will be totally ignored.\
To blacklist someone, simply require the functions `blacklist, whitelist` defined in `./src/utils/utils`.
### How to use pagination
First, require the function `paginate` defined in `./src/utils/utils`. The function requires two parameters: `message` and `embeds`.\
`message`: just the message object _(to send the paginated message, get the author to listen to the reactions to, etc.)_.\
`embeds`: an array of embed objects. Yes, a MessageEmbed is a plain old JavaScript object. There is a better explanation with examples in `src/utils/paginate.md`.\
The function also has an optional parameter `optional`: `optional = { time: maxTimeInMs }` _default time: 30000ms_
## What now?
If you have any suggestions for new features or encounter any bugs from the prefab itself; my DMs are always open.
