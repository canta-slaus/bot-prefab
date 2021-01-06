import { Command } from "../types";

export default {
  name: "",
  aliases: [],
  category: "",
  usage: "",
  description: "",
  examples: "",
  cooldown: 0,
  canNotDisable: false,
  perms: [],
  clientPerms: [],
  devOnly: false,
  someServersOnly: false,
  serverOwnerOnly: false,
  arguments: [],
  async execute(client, message, args) {},
} as Command;

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

    > canNotDisable [Boolean, optional]
        - whether the command can be disabled in the server
        - default: false
      [ - set it to 'true', if you don't want this command to be disabled ]

    > perms [Array of PermissionFlags, optional]
        - the perms the user needs to use this command
        - default: no permissions needed to use this 

    > clientPerms [Array of PermissionFlags, optional]
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

        - ArgumentType: NUMBER, INTEGER, CHANNEL, ROLE, AUTHOR_OR_MEMBER, ROLE_OR_MEMBER, STRING
        - prompt: The message to sent if the command user didn't provide                            [optional, will not send a message and simply return if not set]
        - check out `src/utils/utils.md` for more information

*/
