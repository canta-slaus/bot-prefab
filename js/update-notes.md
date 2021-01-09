# 10/01/2021
- To improve the cooldown mechanics (e.g. it would set a cooldown even if they didn't use the command properly):
    - Added `setCooldown()` and `getCooldown()`
    - `setCooldown()` adds a cooldown to a command
    - `getCooldown()` is a helper method to figure out how long the cooldown for that person is (including the custom server cooldowns)
    - Also, all cooldowns now are stored in the client object with `client.serverCooldowns` and `client.globalCooldowns` and updated the main file and the typings
    - Updated the [`message event`](src/eventHandlers/message.js) to work with the new changes
    - Updated all commands (added a `setCooldown()`)
    - DISCLAIMER: You _have_ to add the `setCooldown()` method to _every_ command (add it where you want the cooldown to be set, e.g. **after** all the command usage checks have been made)
    - Hint: just like in every prefab sided command, just do
    ```js
    const { setCooldown } = require('./path/to/utils/utils.js');

    //

    setCooldown(client, this, message); // the 'this' points at the very own module.exports, so we're passing in the command we're currently using
    ```
# 09/01/2021
- When translating the code into TS, I found a lot of small bugs that went unnoticed and forgot to document each of them (quite a lot of typos). If you encounter any bug in your project, please check the current version of the prefab to see if it already has been fixed or not.
# 06/01/2021
- Added [`channels`](src/commands/channels.js) command:
    - A command to allow users to disable/enable channels (the bot will ignore commands sent in that channel)
    - Added `ignoreDisabledChannels` command property that will ignore whether a channel is disabled or not
    - Added [`channelDelete`](src/eventHandlers/channelDelete.js) event listener to remove a channel from the database if it was disabled
    - Added `disabledChannels` property to the [guild schema](schemas/guildSchema.js) as well as to the [`typings`](src/typings.d.js) and [`command prefab`](src/utils/prefab.js)
    - Added the needed if statement to check for disabled channels in the [`message event`](src/eventHandlers/message.js)
    - Added the description/usage to [`languages`](config/languages.json)
    - Special thanks to Qzxy for providing the idea and most of the code needed <3
- Additionally added two new command properties: `hideCommand` and `globalCooldown`
    - `hideCommand: true` will not display any help about the command and will not show it in any category
    - Updated the [`help command`](src/commands/help.js) and [`command registration`](src/utils/registry.js)
    - `globalCooldown: true` the cooldown on this command applies globally for the user
    (When setting a command to use local cooldowns, it is suggested to have `canNotSetCooldown: true` since otherwise it will get a bit messy for users that share multiple servers with the bot and use commands across them.)
    - Updated [`message event`](src/eventHandlers/message.js) to check for global/local cooldowns of a command
    - Added both properties to the [`typings`](src/typings.d.js) and [`command prefab`](src/utils/prefab.js)
- Updated [`utils`](src/utils/utils.js):
    - Added three new reactions to `paginate`:
        - ⏪: to get back to the first page
        - ⏩: to skip forward to the last page
        - 🔢: send a number to jump to that page
    - Updated the ⏸️ reaction:
        - will now delete the pagination embed
    - Added types for `log`
- Fixed typos and other changes:
    - Documentation typo in [`utils`](src/utils/utils.js) (for the CustomEmbed class)
    - [`roleDelete`](src/eventHandlers/roleDelete.js): used `message` instead of `role`
    - [`alias`](src/commands/alias.js): the `if` statement to check whether or not users can add custom aliases was the wrong way around
    - [`message event`](src/eventHandlers/message.js):
        - Changed `message.channel.type === 'dm'` to `message.channel.text !== 'text'` and added `message.webhookID` to the first `if` statement
        - Changed `!message.guild.me.permissions.has(command.clientPerms)` to `!message.channel.permissionsFor(message.guild.me).has(command.clientPerms)` since the bot could have the permissions generally but not in the specific channel
    - Changed how guild info was cached when a command has been enabled in [`commands`](src/commands/commands.js)

# 30/12/2020
- Added [`setcolor`](src/commands/setcolor) command:
    - A feature to allow any user to chose their own embed color
    - Added [`config/colors.json`](config/colors.json) to store all available colors
    - Added `CustomEmbed` class (it extends MessageEmbed but automatically sets the embed color to the user color) in [`src/utils/utils.js`](src/utils/utils.js), simply require it and pass in the client and the user ID that this embed is meant for (You can also add your own stuff to the embed to reduce some code for the embeds)
    - Added `embedColor` to the [`schemas/userSchema.js`](schemas/userSchema.js) as well to the userInfo type in [`src/typings.d.js`](src/typings.d.js)
    - Updated every command that sends embeds to use the CustomEmbed class
- Added more options for commands:
    - `canNotSetCooldown`: users may not set their own custom cooldowns for this command
    - `canNotAddAlias`: users may not add their own custom aliases for this command
    - added both to [`src/utils/prefab.js`](src/utils/prefab.js), as well as in the Command type definition
    - added the necessary if statements in both commands
- Further added language support for the help command:
    - Changed every word/text in the help embeds to be customizable for each language (see [`config/languages.json`](config/languages.json)) for the template
    - This also includes category names, the help command will still only work with the english category name

# 29/12/2020
- Added `alias` command:
    - A feature to allow server owners to add custom aliases for any command
    - Added `commandAlias` to the guild schema and to the guildInfo type
    - Updated the help command to recognize aliases and updated the message event
- Fixed missing text in `setlanguage` command when invalid language was provided

# 26/12/2020
- Added `setlanguage` command:
    - A feature to allow any user to chose their own language to be used for the help commands
    - To support this feature in your project: Move all command help strings, like the description, usage, examples etc. into the newly added file [`config/languages.json`](config/languages.json)
    - Command help strings are deprecated inside of the command file itself, they can still stay there but those will not be displayed
    - Added the user schema, as well as cache for the `userInfo`
- Added JSDoc type definitions:
    - Similar to TypeScript type definitions, one can utilize JSDoc to let the code editor what types you're dealing with and to enable better code-autocompletion
    - All current types and structures are defined in [`src/typings.d.js`](src/typings.d.js) _(similar to TypeScript d.ts files)_
    - To make use of it in the commands, add the following at the top:
    ```js
    /**
    * @type {import('../typings.d').Command}
    */
    ```
    - Since the client used in the prefab has a lot of new properties other than the Discord.js Client, it also has it's own type definition. It can be used when defining the client object in events, by adding:
    ```js
    /**
    * @param {import('../typings.d').myClient} client
    */
    ```
    As seen in the prefab events.
    - Advantages: If this doesn't seem to make a lot of sense yet, however, there are a lot of advantages on using the defined types, e.g.:
        - If you define the type for a command, your code editor will know exactly which command properties exist, what type they are and especially for properties like `perms`, `clientPerms` or `arguments`, it will tell you which permissions there are for `perms` and `clientPerms`. It will also tell you what argument types there are if you type
        ```js
        arguments: [
            {
                type:
            }
        ]
        ```
        - Your code editor also knows that `client.DBGuild` is a mongoose collection and what the document from e.g. `client.DBGuild.findById(message.author.id)` will retur.
        - Besides the default Discord Client properties/methods, it also knows about all the prefab-side properties like: `client.commands`, `client.categories` as well as all cache collections
- Fixed several typos and updated all commands to make use of the type definitions and language feature

# 16/12/2020
- Added `cooldowns` command:
    - you can now change the cooldowns of a command per server for each role individually
    - added `commandCooldowns` to the `guildSchema`
    - added `roleDelete.js` to check if a role with a set cooldown has been deleted (to delete it from the database and cache)
    - added the needed checks in `message.js`
    - added the package `ms` (to convert user input into milliseconds/display the cooldown in readable time and not ms)
- Updated commands
    - made some parts prettier and removed unnecessary code
    - added client perms to them
    - added timeout message to `permissions` command if they don't react to the embed
- Updated `paginate()`
    - added additional checks: e.g. when the message gets deleted while adding reactions, or inside the collector end event (because it also triggers if the message was deleted)
- Updated `registerCommands()`
    - added additional checks: e.g. when a command name or alias has already been added
    - added support for multiple command directories (e.g. you can do `registerCommands(client, '../commands', '../cmds')`)
- Updated `message.js`
    - added the cooldowns feature
    - moved client permissions check up a bit
- Added some small JSDocs snippets to `message.js` and `guildCreate.js` (will improve those in future updates for better code-autocompletion)

# 14/12/2020
- Added command categories:
    - If the `help` command is ran, an embed containing all categories will be sent
    - `help [category name]` will send an embed containing all commands of a category
    - `help [command name]` will now display the server's current prefix (to do that, inside of `command.usage`/`command.description`/`command.examples` all `PREFIX` will be replaced with the server prefix, so make sure to update your commands)
    - If no category was given, it will default to `No category`.
- Fixed guildCreate.js:
    - If bot doesn't have permissions to send messages in default channel
    - If bot doesn't have permissions to send messages in "general" channel
    - If there are no channels the bot can send messages in
- Updated registry.js:
    - Added category relevant features
- Updated main.js:
    - Added new logs
    - Stop bot if no connection to MongoDB was established
- Updated utils.js:
    - Added `log()`
- Updated all commands:
    - Added category
    - Changed `${PREFIX}` to `PREFIX`