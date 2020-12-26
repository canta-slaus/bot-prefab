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