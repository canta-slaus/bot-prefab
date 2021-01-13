/**
 * @type {import('../typings.d').Command} 
 */
module.exports = {
    name: "",
    aliases: [],
    category: "",
    description: "",
    usage: "",
    examples: "",
    cooldown: 0,
    globalCooldown: true,
    canNotDisable: false,
    canNotSetCooldown: false,
    canNotAddAlias: false,
    hideCommand: false,
    perms: [],
    clientPerms: [],
    devOnly: false,
    someServersOnly: false,
    serverOwnerOnly: false,
    arguments: [],
    
    execute: async function({ client, message, args, flags }) {

    }
}

/*

Attributes:
    > name [String, needed]
        - name of the command

    > aliases [Array of Strings, optional]
        - aliases for the command
        - default: no aliases

    > category [String, needed]
        - category of the command (to display all commands of a category in the help message)
        - default: No category

    > usage: [String, optional]
        - how to use the command (will be displayed in the help message)
        - default: no usage

    > description: [String, optional]
        - information about the command (will be displayed in the help message)

    > examples [String, optional]
        - examples of how to use the command (will be displayed in the help message)
        - default: no examples

    > cooldown [Number (Seconds), optional]
        - cooldown of the command
        - default: 0

    > globalCooldown [Boolean, optional]
        - whether the cooldown on this command will be globally or for a server only
        - default: true
      [ -  'true': global cooldown, 'false': server only cooldown ]

    > canNotDisable [Boolean, optional]
        - whether the command can be disabled in the server
        - default: false
      [ - set it to 'true', if you don't want this command to be disabled ]

    > canNotSetCooldown [Boolean, optional]
        - whether the users can set a custom cooldown for this command
        - default: false
      [ - set it to 'true', if you don't want this command to have custom cooldowns ]

    - canNotAddAlias [Boolean, optional]
        - whether the users can add alias for this command
        - default: false
      [ - set it to 'true', if you don't want this command to have custom aliases ]

    - hideCommand [Boolean, optional]
        - whether or not this command will be displayed in the help command
        - default: false
      [ - set it to 'true', if you don't want this command to be displayed in the help command ]

    > perms [Array of Strings, optional]
        - the perms the user needs to use this command
        - default: no permissions needed to use this 

    > clientPerms [Array of Strings, optional]
        - the perms your bot needs to use this command
        - default: no permissions needed

    > devOnly [Boolean, optional]
        - whether only some specific people should be able to use this command
        - default: false
        - check out `src/utils/utils.md` for more information

    > someServersOnly [Boolean, optional]
        - whether this command can only be used in some specific servers
        - default: false
        - check out `src/utils/utils.md` for more information

    > serverOwnerOnly [Boolean, optional]
        - whether only the guild owner can use this command
        - default: false

    > arguments [Array of Objects, optional]
        - Argument Object:
            {
                type: ArgumentType,
                prompt: String
            }

        - ArgumentType: The argument type that the user should provide
        - prompt: The message to sent if the command user didn't provide                            [optional, will not send a message and simply return if not set]
        - check out `src/utils/utils.md` for more information

*/