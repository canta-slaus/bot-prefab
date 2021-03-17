const { Client } = require('discord.js');
const { Model } = require('mongoose');

/**
 * @typedef guildInfo
 * @type {object}
 * @property {string} _id - The guild ID
 * @property {string} prefix - The prefix for the bot
 * @property {string[]} [disabledCommands] - Array with all disabled command names
 * @property {string[]} [disabledChannels] - Array with all channel ID's that are disabled
 * @property {Object.<string, import('discord.js').PermissionString[]>} [commandPerms] - Contains all the custom command permissions for a command
 * @property {Object.<string, Object.<string, number>>} [commandCooldowns] - Contains all custom role cooldowns for a command
 * @property {Object.<string, string>} [commandAlias] - Contains all custom command aliases: { alias: commandName }
 */

/**
 * @typedef userInfo
 * @type {object}
 * @property {string} _id - The user ID
 * @property {string} language - The users language for the command helps
 * @property {string} embedColor - The users embed color
 */

/**
 * @typedef languageHelp
 * @type {object}
 * @property {string} usage 
 * @property {string} aliases
 * @property {string} description
 * @property {string} examples
 * @property {string} noCategory
 * @property {string} cooldown
 * @property {string} isDisabled
 * @property {string} commandCategories
 * @property {string} categoriesHelp
 * @property {string} categoriesName
 * @property {Object.<string, string>} categories
 */

/**
 * @class
 */
class myClient extends Client {
    constructor() {
        /**
         * A collection containing all commands
         * @type {import('discord.js').Collection<Snowflake, Command>}
         */
        this.commands;

        /**
         * A collection containing all categories and the commands inside that category
         * @type {import('discord.js').Collection<Snowflake, string[]>}
         */
        this.categories;

        /**
         * A collection containing all cached guildInfo
         * @type {import('discord.js').Collection<Snowflake, guildInfo>}
         */
        this.guildInfoCache;

        /**
         * A collection containing all cached userInfo
         * @type {import('discord.js').Collection<Snowflake, userInfo>}
         */
        this.userInfoCache;

        /**
         * A set containing all Discord IDs of blacklisted users
         * @type {Set<Snowflake>}
         */
        this.blacklistCache;

        /**
         * A reference to the guildSchema
         * @type {Model<guildInfo, {}>}
         */
        this.DBGuild;

        /**
         * A reference to the guildSchema
         * @type {Model<userInfo, {}>}
         */
        this.DBUser;

        /**
         * A reference to the config schema
         * @type {Model<>}
         */
        this.DBConfig;

        /**
         * A collection containing all stored server cooldowns
         * @type {import('discord.js').Collection<Snowflake, Collection<string, Collection<Snowflake, number>>>}
         */
        this.serverCooldowns;

        /**
         * A collection containing all stored global cooldowns
         * @type {import('discord.js').Collection<string, Collection<Snowflake, number>>}
         */
        this.globalCooldowns;
    }
}

/**
 * @typedef Arguments
 * @type {Array.<SomethingArgument|NumberArgument|ChannelArgument|RoleArgument|AuthorOrMemberArgument|MemberArgument|AttachmentArgument|TimeArgument>}
 */

 /**
  * @typedef Flags
  * @type {Object.<string, *>}
  */

/**
 * @typedef SomethingArgument
 * @type {object}
 * @property {'SOMETHING'} type - The user argument can be anything, maybe a word or a URL - anything
 * @property {string} id - The ID of this argument
 * @property {number} [amount] - The amount of arguments
 * @property {string} [prompt] - The message to send if the user doesn't provide the correct arguments
 * @property {string[]} [words] - An array of words that the user can send
 * @property {RegExp} [regexp] - The user argument should match this regular expression
 */

/**
 * @typedef NumberArgument
 * @type {object}
 * @property {'NUMBER'} type - The user argument has to be a number and will automatically be converted into a number
 * @property {string} id - The ID of this argument
 * @property {number} [amount] - The amount of arguments
 * @property {string} [prompt] - The message to send if the user doesn't provide the correct arguments
 * @property {number} [min] - The minimum that the number can be
 * @property {number} [max] - The maximum that the number can be
 * @property {boolean} [toInteger] - Whether the number should be converted into an integer
 */

/**
 * @typedef ChannelArgument
 * @type {object}
 * @property {'CHANNEL'} type - The user argument has to be a channel and will automatically be converted into a channel
 * @property {string} id - The ID of this argument
 * @property {number} [amount] - The amount of arguments
 * @property {string} [prompt] - The message to send if the user doesn't provide the correct arguments
 * @property {('text'|'voice'|'category'|'news'|'store')[]} [channelTypes] - The channel types that the provided channel can be
 */

/**
 * @typedef RoleArgument
 * @type {object}
 * @property {'ROLE'} type - The user argument has to be a role and will automatically be converted into a role
 * @property {string} id - The ID of this argument
 * @property {number} [amount] - The amount of arguments
 * @property {string} [prompt] - The message to send if the user doesn't provide the correct arguments
 * @property {boolean} [notBot] - The role shouldn't be the default role of a bot
 */

/**
 * @typedef AuthorOrMemberArgument
 * @type {object}
 * @property {'AUTHOR_OR_MEMBER'} type - If the user mentions someone, it will get the mentioned member, otherwise it will be the message member
 * @property {string} id - The ID of this argument
 * @property {boolean} [toUser] - Whether or not the member should be converted into the User object
 */

/**
 * @typedef MemberArgument
 * @type {object}
 * @property {'MEMBER'} type - The user argument has to be a member and will automatically be converted into a member
 * @property {string} id - The ID of this argument
 * @property {number} [amount] - The amount of arguments
 * @property {string} [prompt] - The message to send if the user doesn't provide the correct arguments
 * @property {boolean} [notBot] - The member shouldn't be a bot
 * @property {boolean} [notSelf] - The member shouldn't be the command user
 * @property {boolean} [toUser] - Whether or not the member should be converted into the User object
 */

/**
 * @typedef AttachmentArgument
 * @type {object}
 * @property {'ATTACHMENT'} type - The message has to have an attachment
 * @property {string} id - The ID of this argument
 * @property {string} [prompt] - The message to send if the user doesn't provide the correct arguments
 * @property {string[]} attachmentTypes - The accepted attachment types
 */

/**
 * @typedef TimeArgument
 * @type {object}
 * @property {'TIME'} type - The user argument has to be time and will automatically be converted into milliseconds
 * @property {string} id - The ID of this argument
 * @property {string} [prompt] - The message to send if the user doesn't provide the correct arguments
 * @property {number} [min] - The minimum time they should provide in milliseconds
 * @property {number} [max] - The maximum time they can provide in milliseconds
 */

/**
 * @callback ExecuteFunction
 * @param {ExecuteFunctionParameters}
 */

/**
 * @typedef ExecuteFunctionParameters
 * @property {myClient} ExecuteFunctionParameters.client - The client instance
 * @property {import('discord.js').Message} ExecuteFunctionParameters.message - The message sent by the user
 * @property {string[]} ExecuteFunctionParameters.args - The message arguments
 * @property {Flags} ExecuteFunctionParameters.flags - The processed arguments mapped by their ID
 */

/**
 * @typedef Command
 * @type {object}
 * @property {string} name - The name of the command
 * @property {string[]} [aliases=[]] - Aliases for this command
 * @property {string} [category='No category'] - The category of this command, default is 'No category'
 * @property {string} [description=''] - Description of the command
 * @property {string} [usage=''] - Usage information of the command
 * @property {string} [examples=''] - Examples to further explain the usage of the command
 * @property {number} [cooldown=0] - Cooldown of the command
 * @property {boolean} [globalCooldown=true] - Whether the cooldown on this command will be globally or for a server only
 * @property {boolean} [canNotDisable=false] - Whether or not this command can be disabled in a server
 * @property {boolean} [canNotSetCooldown=false] - Whether or not users can set a custom command cooldown for this command
 * @property {boolean} [canNotAddAlias=false] - Whether or not users can add custom aliases for this command
 * @property {boolean} [hideCommand=false] - Whether or not this command will be displayed in the help command
 * @property {boolean} [ignoreDisabledChannels=false] - Whether or not this command will still run in ignored channels
 * @property {import('discord.js').PermissionString[]} [perms=[]] - Permissions that the user needs in order to use this command
 * @property {import('discord.js').PermissionString[]} [clientPerms=[]] - Permissions that the client needs to run this command
 * @property {boolean} [devOnly=false] - Whether or not this command can only be used by a developer
 * @property {boolean} [someServersOnly=false] - Whether or not this command can only be used in specific servers
 * @property {boolean} [serverOwnerOnly=false] - Whether or not this command can only be used by the server owner
 * @property {boolean} [nsfw=false] - Whether this command can only be used in a NSFW channel
 * @property {Arguments} [arguments=[]] - Arguments that the user should provide
 * @property {ExecuteFunction} execute - The function that will be ran when someone successfully uses a command
 */

module.exports = { myClient }