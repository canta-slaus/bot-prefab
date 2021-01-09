import { model, Schema } from "mongoose";
import { PREFIX } from "../config/config.json";

const guildSchema = new Schema({
  _id: String,
  prefix: {
    default: PREFIX,
    type: String,
  },
  disabledCommands: Array,
  disabledChannels: Array,
  commandPerms: {},
  commandCooldowns: {},
  commandAlias: {}
});

export default model("guildSchema", guildSchema);
