const PREFIX = require('../../config/config.json').PREFIX;

module.exports = {
    name: "",
    aliases: [],
    description: "",
    usage: "",
    examples: "",
    cooldown: 0,
    perms: [],
    arguments: [],
    
    execute: async function(client, message, args) {

    }
}

/*

Attributes:
    > name [String, needed]
        - name of the command

    > aliases [Array of Strings, optional]
        - aliases for the command

    > usage: [String, optional]
        - how to use the command (will be displayed in the help message)
    
    > description: [String, needed]
        - information about the command (will be displayed in the help message)

    > examples [String, optional]
        - examples of how to use the command (will be displayed in the help message)

    > cooldown [Number (Seconds), optional]
        - cooldown of the command

    > perms [Array of Strings, optional]
        - the perms the user needs to use this command

    > arguments [Array of Objects, optional]
        - Argument Object:
            {
                type: ArgumentType,
                prompt: String,
                optional: boolean
            }

        - ArgumentType: NUMBER, CHANNEL, ROLE, MEMBER_OR_USER           [needed]
        - prompt: The message to sent if the command user didn't provide            [optional, will not send a message and simply return]
        - optional: If true, then it will skip it if it wasn't provided by the command user and move to the next argument           [optional, default will be false]

*/