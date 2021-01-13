# 13/01/2021
- Argument system update:
    - The currently existing types: `"SOMETHING"`, `"NUMBER"`, `"CHANNEL"`, `"ROLE"`, `"AUTHOR_OR_MEMBER"`, `"MEMBER"`, `"ATTACHMENT"`, `"TIME"`
    - If you want users to provide arguments when using a command, add the following to your command:
    ```js
    ...
    arguments: [
        {
            type: someType,
            id: someID,
            prompt: somePrompt
        },
        ...
    ]
    ...
    ```
    All of the argument types come with a couple optional settings, make sure to read about them in [`docs.md`](docs.md)
- `Command#execute()` parameters have been slightly changed: For better scaling (e.g. when more parameters will be added in the future), it's no longer `client, message, args` but `{ client: client, message: message, args: args, flags: flags }` (`flags` is the object containing all arguments with their ID as the key)
- Some minor changes like: the JS and TS `src/utils/utils.md` have been removed in favor of a JS only [`docs.md`](docs.md)
# 10/01/2021
- Cooldowns are now set when you want them to, e.g. you can first do all the command usage checks and then set the cooldown, so that no cooldown will be set when they don't know how to use the command properly.
# 09/01/2021
- The TypeScript version has been added! _Thanks to Cursors for laying the foundation <3_
    - There might be small mistakes here and there, but I haven't come across any when testing out all the commands.
    - Some of the types yet need to be improved (coming soon)
- With the addition of the TypeScript version, both versions were moved in separate folders. Read the corresponding update-notes of the versions for a more detailed explanation of the updates for each
- Removed `config.json` in favor of `config.example.json`, when trying to run the project, make sure that you added a `config.json` file with the fields shown in the example file