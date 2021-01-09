# 10/01/2021
- Cooldowns are now set when you want them to, e.g. you can first do all the command usage checks and then set the cooldown, so that no cooldown will be set when they don't know how to use the command properly.
# 09/01/2021
- The TypeScript version has been added! _Thanks to Cursors for laying the foundation <3_
    - There might be small mistakes here and there, but I haven't come across any when testing out all the commands.
    - Some of the types yet need to be improved (coming soon)
- With the addition of the TypeScript version, both versions were moved in separate folders. Read the corresponding update-notes of the versions for a more detailed explanation of the updates for each
- Removed `config.json` in favor of `config.example.json`, when trying to run the project, make sure that you added a `config.json` file with the fields shown in the example file