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
