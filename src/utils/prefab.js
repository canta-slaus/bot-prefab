const PREFIX = require('../../config/config.json').PREFIX;

module.exports = {
    name: "",
    aliases: [],
    description: "",
    usage: "",
    examples: "",
    cooldown: 0,
    canNotDisable: false,
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
        - default: 0

    > canNotDisable [Boolean, optional]
        - whether the command can be disabled in the server
        - default: false
      [ - set it to 'true', if you don't want this command to be disabled ]

    > perms [Array of Strings, optional]
        - the perms the user needs to use this command

    > arguments [Array of Objects, optional]
        - Argument Object:
            {
                type: ArgumentType,
                prompt: String
            }

        - ArgumentType: NUMBER, CHANNEL, ROLE, AUTHOR_OR_MEMBER, ROLE_OR_MEMBER, STRING             [needed]
        - prompt: The message to sent if the command user didn't provide                            [optional, will not send a message and simply return if not set]

*/