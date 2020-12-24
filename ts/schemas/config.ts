import { model, Schema } from "mongoose";

const config = new Schema(
  {
    _id: String,
  },
  { strict: false }
);

export default model("config", config);
