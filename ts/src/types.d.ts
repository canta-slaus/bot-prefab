import Discord from "discord.js";
import { Document, Model } from "mongoose";

export declare class Client extends Discord.Client {
  public commands: Discord.Collection<string, Command>;
  public categories: Discord.Collection<string, string[]>;
  public guildInfoCache: Discord.Collection<Discord.Snowflake, GuildInfo>;
  public userInfoCache: Discord.Collection<Discord.Snowflake, UserInfo>;
  public blacklistCache: Set<Discord.Snowflake>;
  public DBGuild: Model<Document<GuildInfo>>;
  public DBConfig: Model<Document<object>>;
  public DBUser: Model<Document<UserInfo>>;
}

export interface Command {
  name: string;
  aliases?: string[];
  category: string;
  description?: string;
  usage?: string;
  examples?: string;
  cooldown?: number;
  canNotDisable?: boolean;
  perms?: Discord.PermissionResolvable;
  clientPerms?: Discord.PermissionResolvable;
  devOnly?: boolean;
  someServersOnly?: boolean;
  serverOwnerOnly?: boolean;
  arguments?: Argument[];
  execute(
    client: Client,
    message: Discord.Message,
    args: [
      | string
      | Discord.Role
      | Discord.Channel
      | Discord.GuildMember
      | Discord.MessageAttachment
    ]
  ): any;
}

export interface GuildInfo {
  prefix: string;
  disabledCommands?: string[];
  commandPerms?: { [name: string]: Discord.PermissionString[] };
  commandCooldowns?: {
    [nameOfTheCommand: string]: { [id: number]: number };
  };
  commandAliases?: { [alias: string]: string };
}

export interface UserInfo {
  language: string;
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
}

export type ProcessedArguments =
  | [
      | string
      | Discord.Role
      | Discord.Channel
      | Discord.GuildMember
      | Discord.MessageAttachment
    ]
  | { invalid: true; prompt?: string };
