## How to use this?
### TypeScript
You need to have TypeScript installed (`npm install -g typescript`). To run TS files, you can either compile them into JS files using the `tsc` command, or use [`ts-node`](https://npmjs.com/package/ts-node).
### First steps
First of all, either clone the repo by downloading the zip or using GIT. Then run `npm init` and `npm i`, though this prefab only requires discord.js and a few additional packages only so far.
Then, go to the config file, add a `config.json` file as show in [`config/config.example.json`](ts/config/config.example.json) and add your bot token, the default prefix to use and your MongoDB URI, as well as other information.

### How to add new commands
To add a new command, simply create a new file inside the [`src/commands`](ts/src/commands) folder (you can also put them into subfolders and so on). Then head over to [`src/utils/prefab.ts`](ts/src/utils/prefab.ts). `prefab.ts` is a command template that you can copy and paste to make creating commands easier and faster (who wants to type the same couple lines over and over, anyway). The prefab file comes with some comments at the very bottom of it, make sure to read the comments to get an understanding of all the properties of a command.
### How to add new events
To listen to new events, create a new file within [`src/events`](ts/src/events) and with the event name as the file name, e.g. `guildMemberAdd.ts` (keep in mind that you need to enable priveleged intents in order to listen to this event). Then inside that file, add
```ts
import Discord from "discord.js";
import { Client } from "../types";

export default async (client: Client, member: Discord.GuildMember) => {
    console.log("Someone joined a server!")
}
```
The ClientUser will be passed on by the event handler, just add how many parameters the event provides and you're good to go.
Another example: `messageReactionAdd.ts`
```ts
import Discord from "discord.js";
import { Client } from "../types";

export default async (client: Client, messageReaction: Discord.MessageReaction, user: Discord.User) => {
    console.log("Someone reacted to a message!")
}
```
### How to use blacklisting/whitelisting/pagination etc.
There are explanations and examples in the [`utils.md`](utils.md).
## What now?
If you have any suggestions for new features or encounter any bugs from the prefab itself; my DMs are always open.
