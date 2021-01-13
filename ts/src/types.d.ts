import Discord, { Channel, Snowflake } from "discord.js";
import { Document, Model } from "mongoose";

export type ExecuteParameters = {
    client: Client;
    message: Discord.Message;
    args: string[];
    flags: Flags;
}

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

    /** A collection containing all stored server cooldowns */
    public serverCooldowns: Discord.Collection<Snowflake, Discord.Collection<string, Discord.Collection<Snowflake, number>>>;

    /** A collection containing all stored global cooldowns */
    public globalCooldowns: Discord.Collection<string, Discord.Collection<Snowflake, number>>;
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
    arguments?: Arguments;

    /** The function that will be ran when someone successfully uses a command */
    execute(p: ExecuteParameters): any;
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

export type Arguments = (SomethingArgument|NumberArgument|ChannelArgument
                        |RoleArgument|AuthorOrMemberArgument|MemberArgument
                        |AttachmentArgument|TimeArgument)[];

interface SomethingArgument {
    /** The user argument can be anything, maybe a word or a URL - anything */
    type: "SOMETHING";

    /** The ID of this argument */
    id: string;

    /** The amount of arguments */
    amount?: number;

    /** The message to send if the user doesn't provide the correct arguments */
    prompt?: string;

    /** An array of words that the user can send */
    words?: string[];

    /** The user argument should match this certain regular expression */
    regexp?: RegExp;
}

interface NumberArgument {
    /** The user argument has to be a number and will automatically be converted into a number */
    type: "NUMBER";

    /** The ID of this argument */
    id: string;

    /** The amount of arguments */
    amount?: number;

    /** The message to send if the user doesn't provide the correct arguments */
    prompt?: string;

    /** The minimum that the number can be */
    min?: number;

    /** The maximum that the number can be */
    max?: number;

    /** Whether the number should be converted into an integer */
    toInteger?: boolean;
}

interface ChannelArgument {
    /** The user argument has to be a channel and will automatically be converted into a channel */
    type: "CHANNEL";

    /** The ID of this argument */
    id: string;

    /** The amount of arguments */
    amount?: number;

    /** The message to send if the user doesn't provide the correct arguments */
    prompt?: string;

    /** The channel types that the provided channel can be */
    channelTypes?: ("text"|"voice"|"category"|"news"|"store")[];
}

interface RoleArgument {
    /** The user argument has to be a role and will automatically converted into a role */
    type: "ROLE";

    /** The ID of this argument */
    id: string;

    /** The amount of arguments */
    amount?: number;

    /** The message to send if the user doesn't provide the correct arguments */
    prompt?: string;

    /** The role shouldn't be the default role of a bot */
    notBot?: boolean;
}

interface AuthorOrMemberArgument {
    /** If the user mentions someone, it will get the mentioned member, otherwise it will be the message member */
    type: "AUTHOR_OR_MEMBER";

    /** The ID of this argument */
    id: string;

    /** The message to send if the user doesn't provide the correct arguments */
    prompt?: string;

    /** Whether or not the member should be converted into the User object */
    toUser?: boolean;

}

interface MemberArgument {
    /** The user argument has to be a member and will automatically be converted into a member */
    type: "MEMBER";

    /** The ID of this argument */
    id: string;

    /** The amount of arguments */
    amount?: number;

    /** The message to send if the user doesn't provide the correct arguments */
    prompt?: string;

    /** The member shouldn't be a bot */
    notBot?: boolean;

    /** The member shouldn't be the command user */
    notSelf?: boolean;

    /** Whether or not the member should be converted into the User object */
    toUser?: boolean;
}

interface AttachmentArgument {
    /** The message has to have an attachment */
    type: "ATTACHMENT";

    /** The ID of this argument */
    id: string;

    /** The message to send if the user doesn't provide the correct arguments */
    prompt?: string;

    /** The accepted attachment types */
    attachmentTypes: string[];
}

interface TimeArgument {
    /** The user argument has to be time and will automatically be converted into milliseconds */
    type: "TIME";

    /** The ID of this argument */
    id: string;

    /** The message to send if the user doesn't provide the correct arguments */
    prompt?: string;

    /** The minimum time they should provide in milliseconds */
    min?: number;

    /** The maximum time they can provide in milliseconds */
    max?: number;
}

export type Flags =
    { 
        [id: string]:
            (string|number|Discord.GuildChannel|Discord.Role|Discord.GuildMember|Discord.User|Discord.MessageAttachment)
     | Array<string|number|Discord.GuildChannel|Discord.Role|Discord.GuildMember|Discord.User|Discord.MessageAttachment>
    }
