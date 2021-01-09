import Discord from "discord.js";
import { Document, Model } from "mongoose";

export declare class Client extends Discord.Client {
    /** A collection containing all commands */
    public commands: Discord.Collection<string, Command>;

    /** A collection containing all categories and the commands inside that category */
    public categories: Discord.Collection<string, string[]>;

    /** A collection containing all cached guildInfo */
    public guildInfoCache: Discord.Collection<Discord.Snowflake, GuildInfo>;

    /** A collection containing all cached userInfo */
    public userInfoCache: Discord.Collection<Discord.Snowflake, UserInfo>;

    /** A set containing all Discord IDs of blacklisted users */
    public blacklistCache: Set<Discord.Snowflake>;

    /** A reference to the guildSchema */
    public DBGuild: Model<GuildInfo>;

    /** A reference to the config schema */
    public DBConfig: Model<object>;

    /** A reference to the guildSchema */
    public DBUser: Model<UserInfo>;
}

export interface Command {
    /** The name of the command */
    name: string;

    /** Aliases for this command */
    aliases?: string[];

    /** The category of this command, default is 'No category' */
    category: string;

    /** DEPRECATED: Description of the command - now moved to languages.json */
    description?: string;

    /** DEPRECATED: Usage information of the command - now moved to languages.json */
    usage?: string;

    /** DEPRECATED: Examples to further explain the usage of the command - now moved to languages.json */
    examples?: string;

    /** Cooldown of the command */
    cooldown?: number;

    /** Whether the cooldown on this command will be globally or for a server only */
    globalCooldown?: boolean;

    /** Whether or not this command can be disabled in a server */
    canNotDisable?: boolean;

    /** Whether or not users can set a custom command cooldown for this command */
    canNotSetCooldown?: boolean;

    /** Whether or not users can add custom aliases for this command */
    canNotAddAlias?: boolean;

    /** Whether or not this command will be displayed in the help command */
    hideCommand?: boolean;

    /** Whether or not this command will still run in ignored channels */
    ignoreDisabledChannels?: boolean;

    /** Permissions that the user needs in order to use this command */
    perms?: Discord.PermissionResolvable[];

    /** Permissions that the client needs to run this command */
    clientPerms?: Discord.PermissionResolvable[];

    /** Whether or not this command can only be used by a developer */
    devOnly?: boolean;

    /** Whether or not this command can only be used in specific servers */
    someServersOnly?: boolean;

    /** Whether or not this command can only be used by the server owner */    
    serverOwnerOnly?: boolean;

    /** Arguments that the user should provide */
    arguments?: Argument[];

    /** The function that will be ran when someone successfully uses a command */
    execute(
    client: Client,
    message: Discord.Message,
    args: (string)[]): any;
}

export interface GuildInfo {
    /** This guilds prefix for the bot */
    prefix: string;

    /** Array with all disabled command names */
    disabledCommands: string[];

    /** Array with all channel ID's that are disabled */
    disabledChannels: Discord.Snowflake[];

    /** Contains all the custom command permissions for a command */
    commandPerms?: { [name: string]: Discord.PermissionString[] };

    /** Contains all custom role cooldowns for a command */
    commandCooldowns?: {
        [nameOfTheCommand: string]: { [id: string]: number };
    };

    /** Contains all custom command aliases */
    commandAlias?: { [alias: string]: string };
}

export interface UserInfo {
    /** The users language for the command helps */
    language: string;

    /** The users embed color */
    embedColor: string;
}

export class Argument {
    public type:
        | "NUMBER"
        | "INTEGER"
        | "CHANNEL"
        | "ROLE"
        | "AUTHOR_OR_MEMBER"
        | "ROLE_OR_MEMBER"
        | "SOMETHING"
        | "MEMBER"
        | "IMAGE";
    public amount?: number;
    public prompt?: string;
    public returnUsers?: boolean;
}

export type ProcessedArguments =
    | [
        | string
        | number
        | Discord.Role
        | Discord.Channel
        | Discord.GuildMember
        | Discord.MessageAttachment
        ]
    | { invalid: true; prompt?: string };