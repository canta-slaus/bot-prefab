const { PermissionResolvable, Client, Message, Collection, Snowflake, MessageEmbed, TextChannel, Role, User, GuildMember, MessageAttachment } = require('discord.js')
const { Model } = require('mongoose')

/**
 * @typedef guildInfo
 * @type {object}
 * @property {string} prefix - The prefix for the bot
 * @property {string[]} [disabledCommands] - Array with all disabled command names
 * @property {string[]} [disabledChannels] - Array with all channel ID's that are disabled
 * @property {Object.<string, PermissionResolvable>} [commandPerms] - Contains all the custom command permissions for a command
 * @property {Object.<string, Object.<string, number>>} [commandCooldowns] - Contains all custom role cooldowns for a command
 * @property {Object.<string, string>} [commandAlias] - Contains all custom command aliases: { alias: commandName }
 */

/**
 * @typedef userInfo
 * @type {object}
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
         * @type {Collection<Snowflake, Command>}
         */
        this.commands;

        /**
         * A collection containing all categories and the commands inside that category
         * @type {Collection<Snowflake, string[]>}
         */
        this.categories;

        /**
         * A collection containing all cached guildInfo
         * @type {Collection<Snowflake, guildInfo>}
         */
        this.guildInfoCache;

        /**
         * A collection containing all cached userInfo
         * @type {Collection<Snowflake, userInfo>}
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
         * @type {Collection<Snowflake, Collection<string, Collection<Snowflake, number>>>}
         */
        this.serverCooldowns;

        /**
         * A collection containing all stored global cooldowns
         * @type {Collection<string, Collection<Snowflake, number>>}
         */
        this.globalCooldowns;
    }
}

/**
 * @callback ExecuteFunction
 * @param {myClient} client - The client instance
 * @param {Message} message - The message sent by the user
 * @param {Array.<number|TextChannel|Role|User|GuildMember|string|MessageAttachment>} args - The processed arguments
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
 * @property {PermissionResolvable} [perms=[]] - Permissions that the user needs in order to use this command
 * @property {PermissionResolvable} [clientPerms=[]] - Permissions that the client needs to run this command
 * @property {boolean} [devOnly=false] - Whether or not this command can only be used by a developer
 * @property {boolean} [someServersOnly=false] - Whether or not this command can only be used in specific servers
 * @property {boolean} [serverOwnerOnly=false] - Whether or not this command can only be used by the server owner
 * @property {Arguments} [arguments=[]] - Arguments that the user should provide
 * @property {ExecuteFunction} execute - The function that will be ran when someone successfully uses a command
 */

module.exports = { myClient }