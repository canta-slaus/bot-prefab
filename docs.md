# Contents
- [How the prefab works](#how the prefab works)
- [Command handling and command properties](#command handling)
- [Command arguments](#command arguments)
- [Others](#others)
## How the prefab works
The main entry point is `src/main.js`. In there we first add a few new properties to our client, like `client.commands`. Before we login, we loop over the `src/commands` folder and add all the commands to the collection (`Collection<string, Command>`). Additionally, when adding a new command, the `registerCommands()` makes sure that:
- the command has a name, execute, etc.
- a command with the same name/alias hasn't been added yet
For the event handling: It is similar to `registerCommands()`, `registerEvents()` will loop over the `src/events` folder and _bind_ all the exported methods to the corresponding event. (Both methods work perfectly fine if you have your files inside subfolders and both also support multiple directories to be loaded simultaneously, e.g.: `registerCommands(client, '../commands', '../evenMoreCommands');`).\

For better IntelliCode completions, all client properties, command properties, collection types, etc. have been defined in the `typings.d.js` file.\
## Command handling
The command handling all takes part in the message event (`src/eventHandlers/message.js`). In there, we check whether or not the user wants to use a command. We then get the command from the `client.commands` collection and start checking for all the command properties like needed user permissions, cooldowns, command arguments, etc. (including all feature-related checks like per server command permissions, cooldowns, ... )\
All the possible command properties are documented in the `prefab.js` file which is a copy-paste template to easily add new commands.\
### Command properties
|      Property     |          Type          |             Optional             | Description                                                                                                                                                                                                 |                                                                                    Example                                                                                   |
|:-----------------:|:----------------------:|:--------------------------------:|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
|        name       |        `string`        |              `false`             | The name of the command. Will be used to call the command.                                                                                                                                                  |                                                                                 `name: 'add'`                                                                                |
|      aliases      |       `string[]`       |       `true` default: `[]`       | Additional aliases ("command names") for the command. _(will be displayed in the help message)_                                                                                                             |                                                                               `aliases: ['a']`                                                                               |
|      category     |        `string`        | `false` default: `'No category'` | The category of the command (to display all commands of a category in the help message)                                                                                                                     |                                                                              `category: 'Math'`                                                                              |
|       usage       |        `string`        |       `true` default: `''`       | The usage of the command _(will be displayed in the help message)_ **deprecated**                                                                                                                           |                                                                    `usage: 'PREFIXadd [number] [number]'`                                                                    |
|    description    |        `string`        |       `true` default: `''`       | The description of the command. _(will be displayed in the help message)_ **deprecated**                                                                                                                    |                                                                       `description: 'Add two numbers.'`                                                                      |
|      examples     |        `string`        |       `true` default: `''`       | Examples of how to use the command. _(will be displayd in the help message)_ **deprecated**                                                                                                                 |                                                                       `examples: 'PREFIXadd 1991 1203'`                                                                      |
|      cooldown     |        `number`        |        `true` default: `0`       | The cooldown for this command. _(Make sure to call the `setCooldown()` method inside of a command, otherwise no cooldown will be set on the command, ever)_                                                 |                                                                                `cooldown: 10`                                                                                |
|   globalCooldown  |        `boolean`       |      `true` default: `true`      | Whether the cooldown on this command will apply globally or for a server only.                                                                                                                              |                                                                            `globalCooldown: true`                                                                            |
|   canNotDisable   |        `boolean`       |      `true` default: `false`     | Whether a command can be disabled in a server using the `commands` command. _(Set it to `true` if you don't want this command to be disabled)_                                                              |                                                                            `canNotDisable: false`                                                                            |
| canNotSetCooldown |        `boolean`       |      `true` default: `false`     | Whether or not the users can set a custom server-only cooldown for this command. _(Set it to `true` if you don't want this command to have custom cooldowns, suggested for commands that call an API e.g.)_ |                                                                           `canNotSetCooldown: true`                                                                          |
|   canNotAddAlias  |        `boolean`       |      `true` default: `false`     | Whether or not the users can add custom server-only aliases for this command. _(Set it to `true` if you don't want this command to have custom aliases)_                                                    |                                                                            `canNotAddAlias: true`                                                                            |
|    hideCommand    |        `boolean`       |      `true` default: `false`     | Whether or not this command will be hidden. _(That means it will not be displayed in the help command)_                                                                                                     |                                                                             `hideCommand: false`                                                                             |
|       perms       | `PermissionResolvable` |        `true` default `[]`       | The permissions a user needs to use this command.                                                                                                                                                           |                                                                                  `perms: []`                                                                                 |
|    clientPerms    | `PermissionResolvable` |       `true` default: `[]`       | The permissions the client bot should have to run this command                                                                                                                                              |                                                                       `clientPerms: ['SEND_MESSAGES']`                                                                       |
|      devOnly      |        `boolean`       |      `true` default: `false`     | Whether or not only some users can use this command. _(Add the Discord user ID of the "devs" in the `config/config.json` file: `devs: ['THEIR_ID_HERE']`)_                                                  |                                                                               `devOnly: false`                                                                               |
|  someServersOnly  |        `boolean`       |      `true` default: `false`     | Whether or not this command can only be used in some servers. _(Add the Discord server ID of the server/s in the `config/config.json` file: `someServers: ['THE_ID_HERE']`)_                                |                                                                           `someServersOnly: false`                                                                           |
|  serverOwnerOnly  |        `boolean`       |      `true` default: `false`     | Whether or not this command can only be used by the server owner.                                                                                                                                           |                                                                           `serverOwnerOnly: false`                                                                           |
|     arguments     |      `Argument[]`      |       `true` default: `[]`       | The arguments a user should provide in order to use this command.                                                                                                                                           | ```js arguments: [     {         type: 'NUMBER',         amount: 2,         prompt: 'Please provide two numbers that you want to add',         id: 'nums'      }  ] ```      |
|      execute      |       `function`       |              `false`             | The function that will be ran when someone uses the command successfully.                                                                                                                                   | ```js execute: async function ({ client, message, flags }) {     message.channel.send(`${message.author.username}, the result is: ${flags.nums[0] + flags.nums[1]}`)  }  ``` |
## Command arguments
|     Argument     |                       Options                       |                                                                                                                                                                                                                                  Description                                                                                                                                                                                                                                 | Example                                                                                                                                                                                                 |
|:----------------:|:---------------------------------------------------:|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|     SOMETHING    |             `id` `amount` `prompt` `words` `regexp` | The user argument can be anything, maybe a word or a URL - anything The ID for this argument. _req._ How many of this argument the user should provide. _opt._ The message to send if the user doesn't provide the correct arguments. _opt._ An array of words that the user can send. _opt._ The user argument should match this regular expression. _opt._                                                                                                                 | ```js {     type: 'SOMETHING',     id: 'fruit',     prompt: 'Please provide a valid fruit.',     words: ['orange', 'apple', 'banana']  } ```                                                            |
|      NUMBER      |      `id` `amount` `prompt` `min` `max` `toInteger` | The user argument has to be a number and will automatically be converted into a number The ID for this argument. _req._ How many of this argument the user should provide. _opt._ The message to send if the user doesn't provide the correct arguments. _opt._ The minimum that the number can be. _opt._ The maximum that the number can be. _opt._ Whether or not the number should be converted into an integer. _opt._                                                  | ```js {     type: 'NUMBER',     id: 'num',     prompt: 'Please provide a number between 1 and 100',     min: 1,     max: 100,     toInteger: true  } ```                                                |
|      CHANNEL     |               `id` `amount` `prompt` `channelTypes` | The user argument has to be a channel (mention or ID) and will automatically be converted into a channel The ID for this argument. _req._ How many of this argument the user should provide. _opt._ The message to send if the user doesn't provide the correct arguments. _opt._ The channel types that the provided channel can be. _opt._                                                                                                                                 | ```js {     type: 'CHANNEL',     id: 'channels',     amount: 2,      prompt: 'Please provide two channels',     channelsTypes: ['text']  } ```                                                          |
|       ROLE       |                     `id` `amount` `prompt` `notBot` | The user argument has to be a role (mention or ID) and will automatically be converted into a role The ID for this argument. _req._ How many of this argument the user should provide. _opt._ The message to send if the user doesn't provide the correct arguments. _opt._ The role shouldn't be the default role of a bot. _opt._                                                                                                                                          | ```js {     type: 'ROLE',     id: 'role',     notBot: true,     prompt: 'Please specify the Giveaway notifications role'  }  ```                                                                        |
| AUTHOR_OR_MEMBER |                                       `id` `toUser` | If the user mentions someone (or sends their ID), it will get the mentioned member, otherwise it'll be the message member. The ID for this argument. _req._ Whether the resulting member should be converted into the User object. _opt._                                                                                                                                                                                                                                    | ```js {     type: 'AUTHOR_OR_MEMBER',     id: 'user',     toUser: true  }  ```                                                                                                                          |
|      MEMBER      |  `id` `amount` `prompt` `notBot` `notSelf` `toUser` | The user argument has to be a member (mention or ID) and will automatically be converted into a member The ID for this argument. _req._ How many of this argument the user should provide. _opt._ The message to send if the user doesn't provide the correct arguments. _opt._ The mentioned member shouldn't be a bot. _opt._ The mentioned member shouldn't be the message member. _opt._ Whether the member should be converted into the User object. _opt._             | ```js {     type: 'MEMBER',     id: 'members',     notBot: true,     notSelf: true,     amount: 10,     toUser: true,     prompt: 'Please provide 10 people that will participate at the game.'  }  ``` |
|    ATTACHMENT    |                     `id` `prompt` `attachmentTypes` | The message has to have an attachment included The ID of this argument. _req._ The message to send if the user doesn't provide the correct arguments. _opt._ The accepted attachment types. _opt._                                                                                                                                                                                                                                                                           | ```js {     type: 'ATTACHMENT',     id: 'image',     attachmentTypes: ['png', 'jpg', 'gif', 'jpeg']  }  ```                                                                                             |
|       TIME       |                           `id` `prompt` `min` `max` | The user argument has to be time and will automatically be converted into milliseconds._(Careful: It will try to take the whole remaining arguments array and convert it into time, it is suggested to use this argument as the last one)_ The ID of this argument. _req._ The message to send if the user doesn't provide the correct arguments. _opt._ The minimum time they can provide in milliseconds. _opt._ The maximum time they can provide in milliseconds. _opt._ |                                                                                                                                                                                                         |
### Examples
E.g.: If you are making a command that requires the user to pass in a number, simply add
```js
arguments: [
    {
        type: 'NUMBER',
        prompt: 'Please enter a valid number',
        id: 'num'
    }
]
```
to your command and the function will take care of the rest. If the user didn't provide a number, it will send a message as defined in the `prompt` and won't execute the command. If they do send a valid number, it will continue. The order of the arguments will be kept, that is:
```js
/**
 * @type {import('../typings.d').Command} 
 */
module.exports = {
    name: "test",
    description: "Test command to demonstrate the arguments property.",
    arguments: [
        {
            type: 'NUMBER',
            prompt: 'Please enter a valid number.',
            id: 'nums'
            amount: 2
        },
        {
            type: 'SOMETHING',
            prompt: 'Please enter an operation',
            words: ['add', 'sub', 'div', 'mul'],
            id: 'op'
        }
    ],
    execute: async function({ client, message, flags }) {
        console.log(flags)
    }
}
```
If they do `test 1 2 add`, it will log `{ nums: [ 1, 2 ], op: 'add' }.`\
## Others
### Pagination
First, require the function `paginate` defined in [`src/utils/utils.js`](js/src/utils/utils.js). The function requires two parameters: `message` and `embeds`.\
`message`: just the message object _(to send the paginated message, get the author to listen to the reactions to, etc.)_.\
`embeds`: an array of embed objects. Yes, a MessageEmbed is a plain old JavaScript object.\
The function also has an optional parameter `optional`: `optional = { time: maxTimeInMs }` _default time: 30000ms_
The `embeds` parameter from the `paginate` function expects an array of embeds. The order does matter: The function will first send the _first_ embed of the array and then switch between them depending on the reaction.\
Now, a few examples on how you could create embeds and use the `paginate` function.
```js
const { paginate, CustomEmbed } = require('../utils/utils')

/**
 * @type {import('../typings.d').Command} 
 */
module.exports = {
    name: "test",
    description: "test command to demonstrate the pagination function",

    execute: async function({ client, message }) {
        const array = []
        for (let i = 0; i < 10; i++) {
            const embed = new CustomEmbed({ client: client, userID: message.author.id })
            .setTitle('Test Embed')
            .setTimestamp()
            .setDescription(i)
            array.push(embed)
        }

        paginate(message, array, { time: 15000 })
    }
}
```
On a side note, if you try something similar yourself and do anything like:
```js
const { paginate, CustomEmbed } = require('../utils/utils')

/**
 * @type {import('../typings.d').Command} 
 */
module.exports = {
    name: "test",
    description: "test command to demonstrate the pagination function",

    execute: async function({ client, message }) {
        const embed = new CustomEmbed({ client: client, userID: message.author.id })
        .setTitle('Test Embed')
        .setTimestamp()

        const array = []
        for (let i = 0; i < 10; i++) {
            embed.setDescription(i)
            array.push(embed)
        }

        paginate(message, array, { time: 15000 })
    }
}
```
That will not work: All embeds inside `array` will be the same because they are deep copies of `embed`, which means, if you change `embed`, it will change all existing copies of the object.
Another example:
```js
const { paginate, CustomEmbed } = require('../utils/utils')

/**
 * @type {import('../typings.d').Command} 
 */
module.exports = {
    name: "test",
    description: "test command to demonstrate the pagination function",

    execute: async function({ client, message }) {
        const array = []

        const embed1 = new CustomEmbed({ client: client, userID: message.author.id })
        .setTitle('Test Embed')
        .setTimestamp()
        .setDescription('some text')
        array.push(embed1)

        const embed2 = new CustomEmbed({ client: client, userID: message.author.id })
        .setTitle('Test Embed')
        .setTimestamp()
        .setDescription('some more meaningful text')
        array.push(embed2)

        const embed3 = new CustomEmbed({ client: client, userID: message.author.id })
        .setTitle('Test Embed')
        .setTimestamp()
        .setDescription('even more very creative and meaningful text')
        array.push(embed3)
    
        paginate(message, array)
    }
}
```
That isn't very pretty code, but it works.
### Global black-/whitelisting
A blacklisted user will not be able to use any command from your bot and will be totally ignored.\
To blacklist someone, simply require the functions `blacklist, whitelist` defined in [`src/utils/utils.js`](js/src/utils/utils.js).

```js
const { blacklist } = require('../../utils/utils')

/**
 * @type {import('../typings.d').Command} 
 */
module.exports = {
    name: "test",
    description: "Test command to demonstrate blacklisting.",
    arguments: [
        {
            type: 'MEMBER',
            notBot: true,
            notSelf: true,
            prompt: 'Who do you want to blacklist?',
            id: 'user'
        }
    ],
    execute: async function({ client, message, flags }) {
        blacklist(client, flags.user.id)
    }
}
```
It's that easy.
### getReply()
First, require the function `getReply` defined in [`src/utils/utils.js`](js/src/utils/utils.js). The function requires one parameters: `message`.\
`message`: just the message object _(to listen to messages, get the author to listen to the messages to, etc.)_.\
The function also has an optional parameter `optional`:
```js
{
    time: number, // max time in ms, default: 30000
    user: user, // the user to listen to messages to, default: message.author
    words: string[] // array with strings of accepted words, default: [] (all words will be accepted)
    regexp: RegExp // the message content should match this RegExp to be accepted
}
```
This function helps you await a users reply. Let's say you have a quiz command and want to see what the user replied, you could use this function to reduce duplicate code:
```js
const { getReply } = require('../../utils/utils')

/**
 * @type {import('../typings.d').Command} 
 */
module.exports = {
    name: "test",
    description: "Test command to demonstrate \`getReply()\`",
    
    execute: async function({ client, message }) {
        message.channel.send('Are you sure?')

        const reply = await getReply(message, { time: 10000, words: ['yes', 'y', 'n', 'no'] })

        if (['yes', 'y'].includes(reply.content.toLowerCase())) message.channel.send(`${message.author.username} is sure about that.`)
        else message.channel.send(`${message.author.username} isn't so sure about that.`)
    }
}
```
### Misc.
`randomRange(min, max)`
```js
const random = randomRange(10, 20)
console.log(random)
```
`delay(ms)`
```js
await delay(ms)
```