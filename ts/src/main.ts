import Discord from "discord.js";
import mongoose from "mongoose";
import config from "../config/config.json";
import { Client } from "./types";
import { registerCommands, registerEvents } from "./utils/registry";
import { log } from "./utils/utils";

const client = new Discord.Client({
    ws: { intents: Discord.Intents.ALL },
}) as Client;

(async () => {
    client.commands = new Discord.Collection();
    client.categories = new Discord.Collection();
    client.guildInfoCache = new Discord.Collection();
    client.userInfoCache = new Discord.Collection();

    //@ts-ignore
    client.DBGuild = (await import("../schemas/guildSchema")).default;
    //@ts-ignore
    client.DBConfig = (await import("../schemas/config")).default;
    //@ts-ignore
    client.DBUser = (await import("../schemas/userSchema")).default;

    client.serverCooldowns = new Discord.Collection();
    client.globalCooldowns = new Discord.Collection();

    await registerEvents(client, "../events");
    await registerCommands(client, "../commands");

    try {
        await mongoose.connect(config.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        });

        const blacklistFetch = await client.DBConfig.findByIdAndUpdate("blacklist", { }, { new: true, upsert: true, setDefaultsOnInsert: true });
        //@ts-ignore
        client.blacklistCache = new Set(blacklistFetch.blacklisted);

        log("SUCCESS", "src/index.ts", "Connected to the database.");
    } catch (e) {
        log("ERROR", "src/index.ts", `Error connecting to the database: ${e.message}`);
        log("ERROR", "src/index.ts", "As of now, the prefab heavily relies on a successful connection.\nThere is a short guide on how to setup a MongoDB cluster (online cluster, not localhost) over at https://github.com/canta-slaus/bot-prefab/wiki/Setting-up-a-cluster");
        process.exit(1);
    }

    try {
        await client.login(config.TOKEN);
        log(
        "SUCCESS",
        "src/index.ts",
        `Logged in as ${client.user!.tag}`
        );
    } catch (e) {
        log("ERROR", "src/index.ts", `Error logging in: ${e.message}`);
    }

    log("SUCCESS","src/index.ts","Added all commands, categories, events, schemas and connected to MongoDB.");
})();
