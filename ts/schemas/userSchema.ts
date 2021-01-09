import { model, Schema } from "mongoose";
import colors from "../config/colors.json";

const userSchema = new Schema({
  _id: String,
  language: {
      default: 'english',
      type: String
  },
  embedColor: {
      default: colors.default,
      type: String
  }
});

export default model("userSchema", userSchema);
