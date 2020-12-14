const fs = require('fs').promises;
const path = require('path');
const { log } = require('./utils')

async function registerCommands(client, dir) {
    let files = await fs.readdir(path.join(__dirname, dir));
    // Loop through each file.
    for(let file of files) {
        let stat = await fs.lstat(path.join(__dirname, dir, file));
        if(stat.isDirectory()) // If file is a directory, recursive call recurDir
            registerCommands(client, path.join(dir, file));
        else {
            // Check if file is a .js file.
            if(file.endsWith(".js")) {
                try {
                    let cmdModule = require(path.join(__dirname, dir, file));
                    let { name, aliases, category } = cmdModule;

                    if (!name) {
                        log("WARNING", "src/registry.js", `The command '${path.join(__dirname, dir, file)}' doesn't have a name`)
                        continue;
                    }
                    if (!cmdModule.execute) {
                        log("WARNING", "src/registry.js", `The command '${name}' doesn't have an execute function`)
                        continue;
                    }

                    client.commands.set(name, cmdModule);

                    if (category) {
                        let commands = client.categories.get(category.toLoweCase())
                        if (!commands) commands = [category]
                        commands.push(name)
                        client.categories.set(category.toLowerCase(), name)
                    } else {
                        log("WARNING", "src/registry.js", `The command '${name}' doesn't have a category, it will default to 'No category'.`)
                        let commands = client.categories.get('no category')
                        if (!commands) commands = ['No category']
                        commands.push(name)
                        client.categories.set('no category', commands)
                    }

                    if(aliases && aliases.length !== 0)
                        aliases.forEach(alias => client.commands.set(alias, cmdModule));
                } catch (e) {
                    log("ERROR", "src/registry.js", `Error loading commands: ${e.message}`);
                }
            }
        }
    }
}

async function registerEvents(client, dir) {
    let files = await fs.readdir(path.join(__dirname, dir));
    // Loop through each file.
    for(let file of files) {
        let stat = await fs.lstat(path.join(__dirname, dir, file));
        if(stat.isDirectory()) // If file is a directory, recursive call recurDir
            registerEvents(client, path.join(dir, file));
        else {
            // Check if file is a .js file.
            if(file.endsWith(".js")) {
                let eventName = file.substring(0, file.indexOf(".js"));
                try {
                    let eventModule = require(path.join(__dirname, dir, file));
                    client.on(eventName, eventModule.bind(null, client));
                } catch(e) {
                    log("ERROR", "src/registry.js", `Error loading events: ${e.message}`)
                }
            }
        }
    }
}

module.exports = {
    registerEvents, 
    registerCommands 
};